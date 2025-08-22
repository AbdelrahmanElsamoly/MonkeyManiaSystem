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

interface Child {
  id: number;
  name: string;
}

interface PhoneNumber {
  phone_number: { value: string };
  relationship: string;
}

@Component({
  selector: 'app-create-bill-dialog',
  templateUrl: './create-bill-dialog.component.html',
  styleUrls: ['./create-bill-dialog.component.scss'],
})
export class CreateBillDialogComponent implements OnInit {
  // Form Controls
  childrenControl = new FormControl<number[]>([]);
  discount = new FormControl<string>('');
  form!: FormGroup;

  // Data Properties
  itemList: Child[] = [];
  filteredChildren: Child[] = [];
  selectedChildIds: number[] = [];
  searchValue = '';
  label = 'الأطفال';

  // User Info
  private readonly userInfo = JSON.parse(localStorage.getItem('user') || '{}');
  private readonly branch = JSON.parse(localStorage.getItem('branch') || '{}');

  // Relationship Options
  readonly relationshipOptions = [
    { value: 'father', label: 'أب' },
    { value: 'mother', label: 'أم' },
    { value: 'sibling', label: 'أخ / أخت' },
    { value: 'other', label: 'أخرى' },
  ];

  constructor(
    private sharedService: SharedService,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CreateBillDialogComponent>,
    private toaster: ToastrService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadChildren();
    this.setupChildrenControlSubscription();
  }

  // Form Initialization
  private initializeForm(): void {
    this.form = this.fb.group({
      new_children: this.fb.array([]),
    });
  }

  private setupChildrenControlSubscription(): void {
    this.childrenControl.valueChanges.subscribe((value: number[] | null) => {
      this.selectedChildIds = value || [];
      // Update filtered children when selections change
      this.updateFilteredChildren();
    });
  }

  // Getters
  get newChildren(): FormArray {
    return this.form.get('new_children') as FormArray;
  }

  // Data Loading
  private loadChildren(): void {
    this.sharedService.getAllNonActiveChildren().subscribe({
      next: (res: any) => {
        this.itemList = res;
        this.filteredChildren = [...res];
      },
      error: (err) => {
        console.error('Failed to load children:', err);
        this.toaster.error('فشل في تحميل بيانات الأطفال');
      },
    });
  }

  // Child Management
  addNewChild(): void {
    const childForm = this.createChildFormGroup();
    this.newChildren.push(childForm);
  }

  removeNewChild(index: number): void {
    if (index >= 0 && index < this.newChildren.length) {
      this.newChildren.removeAt(index);
    }
  }

  private createChildFormGroup(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      birth_date: ['', Validators.required],
      child_phone_numbers_set: this.fb.array([this.createPhoneNumberGroup()]),
    });
  }

  // Phone Number Management
  addPhoneNumber(childIndex: number): void {
    const phoneNumbers = this.getPhoneNumbersArray(childIndex);
    if (phoneNumbers) {
      phoneNumbers.push(this.createPhoneNumberGroup());
    }
  }

  removePhoneNumber(childIndex: number, phoneIndex: number): void {
    const phoneNumbers = this.getPhoneNumbersArray(childIndex);
    if (phoneNumbers && phoneNumbers.length > 1) {
      phoneNumbers.removeAt(phoneIndex);
    }
  }

  private createPhoneNumberGroup(): FormGroup {
    return this.fb.group({
      phone_number: this.fb.group({
        value: [
          '',
          [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)],
        ],
      }),
      relationship: ['', Validators.required],
    });
  }

  getPhoneNumbersArray(childIndex: number): FormArray | null {
    const childGroup = this.newChildren.at(childIndex);
    return childGroup?.get('child_phone_numbers_set') as FormArray;
  }

  getPhoneControls(childIndex: number): FormGroup[] {
    const phoneArray = this.getPhoneNumbersArray(childIndex);
    return (phoneArray?.controls as FormGroup[]) || [];
  }

  // Child Selection Logic
  getChildNameById(id: number): string {
    const child = this.itemList.find((c) => c.id === id);
    return child?.name || '';
  }

  private updateFilteredChildren(): void {
    const search = this.searchValue.toLowerCase();

    if (!search.trim()) {
      this.filteredChildren = [...this.itemList];
      return;
    }

    // Create array for filtered results
    const filteredResults: Child[] = [];

    // First, add children that match the search
    const matchingChildren = this.itemList.filter((child) =>
      child.name.toLowerCase().includes(search)
    );
    filteredResults.push(...matchingChildren);

    // Then, add selected children that don't match the search (so they remain visible)
    const selectedNonMatchingChildren = this.itemList.filter(
      (child) =>
        this.selectedChildIds.includes(child.id) &&
        !child.name.toLowerCase().includes(search)
    );
    filteredResults.push(...selectedNonMatchingChildren);

    this.filteredChildren = filteredResults;
  }

  onFilterChange(search: string): void {
    this.searchValue = search;
    this.updateFilteredChildren();
  }

  clearFilter(): void {
    this.searchValue = '';
    this.filteredChildren = [...this.itemList];
  }

  isAllSelected(): boolean {
    return (
      this.filteredChildren.length > 0 &&
      this.filteredChildren.every((child) =>
        this.selectedChildIds.includes(child.id)
      )
    );
  }

  toggleSelectAll(): void {
    if (this.isAllSelected()) {
      // Deselect all filtered children
      const remaining = this.selectedChildIds.filter(
        (id) => !this.filteredChildren.some((c) => c.id === id)
      );
      this.childrenControl.setValue(remaining);
    } else {
      // Select all filtered children
      const allIds = [
        ...new Set([
          ...this.selectedChildIds,
          ...this.filteredChildren.map((c) => c.id),
        ]),
      ];
      this.childrenControl.setValue(allIds);
    }
  }

  childClicked(id: number): void {
    const current = this.selectedChildIds;
    if (current.includes(id)) {
      this.childrenControl.setValue(current.filter((i) => i !== id));
    } else {
      this.childrenControl.setValue([...current, id]);
    }
  }

  removeChild(id: number): void {
    const updated = this.selectedChildIds.filter((i) => i !== id);
    this.childrenControl.setValue(updated);

    // Re-apply the current filter to update the displayed list
    this.updateFilteredChildren();
  }

  // Form Validation
  private validateForm(): boolean {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toaster.error('يرجى تصحيح الأخطاء في النموذج');
      return false;
    }

    if (this.selectedChildIds.length === 0 && this.newChildren.length === 0) {
      this.toaster.error('يرجى اختيار طفل واحد على الأقل أو إنشاء طفل جديد');
      return false;
    }

    return true;
  }

  // Payload Generation
  private getPayload() {
    const children =
      this.selectedChildIds.length > 0 ? this.selectedChildIds : undefined;
    const discount = this.discount.value;
    const newChildren = this.buildNewChildrenPayload();
    const branchId = this.getBranchId();
    console.log('this.discount.value', this.discount.value);

    return {
      ...(children && { children }),
      ...(newChildren.length > 0 && { new_children: newChildren }),
      ...(discount ? { discount } : {}),
      branch: branchId,
    };
  }

  private buildNewChildrenPayload() {
    return this.newChildren.controls.map((childGroup) => {
      const { name, birth_date } = childGroup.value;
      const phoneArray = childGroup.get('child_phone_numbers_set') as FormArray;

      return {
        name,
        birth_date,
        child_phone_numbers_set: phoneArray.controls.map((phoneGroup) => ({
          phone_number: {
            value: phoneGroup.get('phone_number.value')?.value,
          },
          relationship: phoneGroup.get('relationship')?.value,
        })),
      };
    });
  }

  private getBranchId(): number {
    return this.userInfo.branch_id ?? this.branch.id;
  }

  // Dialog Actions
  onClose(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    const payload = this.getPayload();

    this.sharedService.createBill(payload).subscribe({
      next: (res: any) => {
        this.toaster.success(res.message || 'تم إنشاء الفاتورة بنجاح');
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Failed to create bill:', err);
        this.toaster.error('فشل في إنشاء الفاتورة');
      },
    });
  }

  // Utility Methods
  getErrorMessage(controlName: string, childIndex?: number): string {
    let control;

    if (childIndex !== undefined) {
      control = this.newChildren.at(childIndex).get(controlName);
    } else {
      control = this.form.get(controlName);
    }

    if (control?.hasError('required')) {
      return 'هذا الحقل مطلوب';
    }
    if (control?.hasError('minlength')) {
      return 'يجب أن يكون النص أطول من حرفين';
    }
    if (control?.hasError('pattern')) {
      return 'تنسيق غير صحيح';
    }

    return '';
  }
}
