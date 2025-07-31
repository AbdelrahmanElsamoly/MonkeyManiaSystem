import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DashboardService } from 'src/app/dashboard/dashboard.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-child-dialog',
  templateUrl: './child-dialog.component.html',
  styleUrls: ['./child-dialog.component.scss'],
})
export class ChildDialogComponent implements OnInit {
  childForm: FormGroup;
  filteredSchools: any[] = [];
  schools: any[] = [];
  isUpdateMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ChildDialogComponent>,
    private dashboardService: DashboardService,
    private toaster: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any // ✅ If editing, data contains child details
  ) {
    this.childForm = this.fb.group({
      name: ['', Validators.required],
      birth_date: ['', Validators.required],
      address: ['', Validators.required],
      notes: [''],
      school: [null],
      child_phone_numbers_set: this.fb.array([this.createPhoneGroup()]),
    });
  }

  ngOnInit() {
    this.getSchools();
    console.log(this.data);
    if (this.data) {
      this.isUpdateMode = true; // ✅ Switch to Update mode
      this.patchChildData(this.data.childData);
    }
  }

  get phoneNumbers(): FormArray {
    return this.childForm.get('child_phone_numbers_set') as FormArray;
  }

  createPhoneGroup(): FormGroup {
    return this.fb.group({
      value: ['', Validators.required],
      relationship: ['father', Validators.required],
    });
  }

  addPhone(phoneData: any = null) {
    const phoneGroup = this.fb.group({
      value: [phoneData?.phone_number || '', Validators.required],
      relationship: [phoneData?.relationship || 'father', Validators.required],
    });
    this.phoneNumbers.push(phoneGroup);
  }

  removePhone(index: number) {
    if (this.phoneNumbers.length > 1) {
      this.phoneNumbers.removeAt(index);
    }
  }

  displaySchool(school: any): string {
    return school && school.name ? school.name : '';
  }

  patchChildData(child: any) {
    this.childForm.patchValue({
      name: child.name,
      birth_date: new Date(child.birth_date),
      address: child.address,
      notes: child.notes,
      school: child.school
        ? this.schools.find((s) => s.id === child.school) || null
        : null,
    });

    this.phoneNumbers.clear();
    if (child.child_phone_numbers_set?.length) {
      child.child_phone_numbers_set.forEach((phone: any) =>
        this.addPhone({
          phone_number: phone.phone_number,
          relationship: phone.relationship,
        })
      );
    } else {
      this.addPhone();
    }
  }

  onSubmit() {
    if (this.childForm.valid) {
      const formValue = this.childForm.value;

      // ✅ Prepare request body
      const body: any = {
        ...formValue,
        birth_date: this.formatDate(formValue.birth_date),
        school: formValue.school ? formValue.school.id : null,
        child_phone_numbers_set: formValue.child_phone_numbers_set.map(
          (item: any) => ({
            phone_number: { value: item.value }, // ✅ Fix: API expects object
            relationship: item.relationship,
          })
        ),
      };

      if (this.isUpdateMode) {
        body['id'] = this.data.childData.id; // ✅ Use correct ID
        this.dashboardService
          .updateChild(this.data.childData.id, body)
          .subscribe({
            next: (res: any) => {
              this.toaster.success(res.message);
              this.dialogRef.close(true);
            },
            error: (err) => {
              console.error('Update Error:', err);
              this.toaster.error('Failed to update child');
            },
          });
      } else {
        this.dashboardService.createChild(body).subscribe({
          next: (res: any) => {
            this.toaster.success(res.message);
            this.dialogRef.close(true);
          },
          error: (err) => {
            console.error('Create Error:', err);
            this.toaster.error('Failed to create child');
          },
        });
      }
    } else {
      this.childForm.markAllAsTouched(); // ✅ Show validation errors
    }
  }

  private formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onClose() {
    this.dialogRef.close();
  }

  getSchools() {
    this.dashboardService.getSchools().subscribe((res: any) => {
      this.schools = res;
      this.filteredSchools = res;

      // ✅ Only patch data after schools are loaded
      if (this.data.childData) {
        this.isUpdateMode = true;
        this.patchChildData(this.data.childData);
      }
    });
  }

  filterSchools(event: Event) {
    const inputValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredSchools = this.schools.filter((mat) =>
      mat.name.toLowerCase().includes(inputValue)
    );
  }
}
