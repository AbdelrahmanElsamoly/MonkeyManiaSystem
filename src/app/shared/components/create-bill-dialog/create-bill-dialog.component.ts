import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { SharedService } from '../../shared.service';
import { MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-bill-dialog',
  templateUrl: './create-bill-dialog.component.html',
  styleUrls: ['./create-bill-dialog.component.scss'],
})
export class CreateBillDialogComponent implements OnInit {
  childrenControl = new FormControl<number[]>([]);
  itemList: any[] = [];
  filteredChildren: any[] = [];
  selectedChildIds: number[] = [];
  searchValue: string = '';
  label = 'الأطفال';
  userInfo = JSON.parse(localStorage.getItem('user') || '{}');
  branch = JSON.parse(localStorage.getItem('branch') || '{}');

  form!: FormGroup;

  constructor(
    private sharedService: SharedService,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CreateBillDialogComponent>,
    private toaster: ToastrService
  ) {}

  ngOnInit(): void {
    this.gettingAllChild();
    this.initializeForm();

    this.childrenControl.valueChanges.subscribe((value: number[] | null) => {
      this.selectedChildIds = value || [];
    });
  }

  initializeForm() {
    this.form = this.fb.group({
      new_children: this.fb.array([]),
    });
  }

  get newChildren(): FormArray {
    return this.form.get('new_children') as FormArray;
  }

  addNewChild() {
    const childForm = this.fb.group({
      name: [''],
      birth_date: [''],
      child_phone_numbers_set: this.fb.array([
        this.fb.group({
          phone_number: this.fb.group({
            value: [''],
          }),
          relationship: [''],
        }),
      ]),
    });

    this.newChildren.push(childForm);
  }

  removeNewChild(index: number) {
    this.newChildren.removeAt(index);
  }

  addPhoneNumber(childIndex: number) {
    const phoneNumbers = this.newChildren
      .at(childIndex)
      .get('child_phone_numbers_set') as FormArray;

    phoneNumbers.push(this.createPhoneNumberGroup());
  }

  removePhoneNumber(childIndex: number, phoneIndex: number) {
    const phoneNumbers = this.newChildren
      .at(childIndex)
      .get('child_phone_numbers_set') as FormArray;

    phoneNumbers.removeAt(phoneIndex);
  }

  createPhoneNumberGroup(): FormGroup {
    return this.fb.group({
      phone_number: this.fb.group({
        value: ['', Validators.required],
      }),
      relationship: ['', Validators.required],
    });
  }

  gettingAllChild() {
    this.sharedService.getAllNonActiveChildren().subscribe((res: any) => {
      this.itemList = res;
      this.filteredChildren = res;
    });
  }

  getChildNameById(id: number): string {
    const child = this.itemList.find((c) => c.id === id);
    return child ? child.name : '';
  }

  onFilterChange(search: string) {
    this.searchValue = search;
    this.filteredChildren = this.itemList.filter((child) =>
      child.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  clearFilter() {
    this.searchValue = '';
    this.filteredChildren = [...this.itemList];
  }

  isAllSelected(): boolean {
    return this.filteredChildren.every((child) =>
      this.selectedChildIds.includes(child.id)
    );
  }

  toggleSelectAll() {
    if (this.isAllSelected()) {
      const remaining = this.selectedChildIds.filter(
        (id) => !this.filteredChildren.some((c) => c.id === id)
      );
      this.childrenControl.setValue(remaining);
    } else {
      const allIds = [
        ...new Set([
          ...this.selectedChildIds,
          ...this.filteredChildren.map((c) => c.id),
        ]),
      ];
      this.childrenControl.setValue(allIds);
    }
  }

  childClicked(id: number) {
    const current = this.childrenControl.value || [];
    if (current.includes(id)) {
      this.childrenControl.setValue(current.filter((i) => i !== id));
    } else {
      this.childrenControl.setValue([...current, id]);
    }
  }

  removeChild(id: number) {
    const updated = this.selectedChildIds.filter((i) => i !== id);
    this.childrenControl.setValue(updated);
  }

  getPhoneControls(group: FormGroup): FormGroup[] {
    const formArray = group.get('child_phone_numbers_set') as FormArray;
    return (formArray?.controls as FormGroup[]) || [];
  }

  onClose(): void {
    this.dialogRef.close();
  }

  // ✅ Get final payload with full nested structure
  getPayload() {
    const children = this.childrenControl.value;

    const new_children = this.newChildren.controls.map((childGroup) => {
      const { name, birth_date } = childGroup.value;
      const phoneArray = childGroup.get('child_phone_numbers_set') as FormArray;

      return {
        name,
        birth_date,
        child_phone_numbers_set: phoneArray.controls.map((phoneGroup) => ({
          phone_number: { value: phoneGroup.get('phone_number.value')?.value },
          relationship: phoneGroup.get('relationship')?.value,
        })),
      };
    });

    let branch;
    if (this.userInfo.branch_id == null) {
      branch = this.branch.id;
    } else {
      branch = this.userInfo.branch_id;
    }

    return {
      ...(children?.length ? { children } : {}),
      ...(new_children.length ? { new_children } : {}),
      branch,
    };
  }

  // ✅ Final submission with service call
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.getPayload();
    console.log('Submitting payload:', payload);

    this.sharedService.createBill(payload).subscribe({
      next: (res: any) => {
        this.toaster.success(res.message);
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Failed to create bill:', err);
      },
    });
  }
}
