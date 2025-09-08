import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class CreateBillDialogComponent implements OnInit, OnDestroy {
  // Form Controls
  childrenControl = new FormControl<number[]>([]);
  discount = new FormControl<string>('');
  form!: FormGroup;

  // Data Properties
  itemList: Child[] = [];
  filteredChildren: Child[] = [];
  selectedChildIds: number[] = [];
  selectedChildren: Child[] = []; // Array to keep selected children data
  private persistentSelectedChildren: Child[] = []; // Persistent storage for selected children
  searchValue = '';
  label = 'الأطفال';

  // Search timeout for debouncing
  private searchTimeout: any;

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
    this.setupChildrenControlSubscription();
    // No initial loading - children will only load when user searches
    this.loadChildren();
  }

  ngOnDestroy(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
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
      this.updateSelectedChildren();
    });
  }

  // Getters
  get newChildren(): FormArray {
    return this.form.get('new_children') as FormArray;
  }

  // Data Loading - Only search, no initial load
  private loadChildren(searchQuery?: string): void {
    const searchTerm = searchQuery?.trim() || 'ن';

    this.sharedService.getAllNonActiveChildren(searchTerm).subscribe({
      next: (res: any) => {
        // Merge search results with persistent selected children
        this.itemList = this.mergeWithPersistentSelected(res);
        this.filteredChildren = [...this.itemList];
      },
      error: (err) => {
        console.error('Failed to load children:', err);
        this.toaster.error('فشل في تحميل بيانات الأطفال');
      },
    });
  }

  // Helper method to merge search results with persistent selections
  private mergeWithPersistentSelected(searchResults: Child[]): Child[] {
    const merged = [...searchResults];

    // Add persistent selected children that are not in search results
    this.persistentSelectedChildren.forEach((selectedChild) => {
      if (!merged.find((child) => child.id === selectedChild.id)) {
        merged.push(selectedChild);
      }
    });

    return merged;
  }

  // Helper method to update selected children array
  private updateSelectedChildren(): void {
    // Find children from all available sources
    const allAvailableChildren = [
      ...this.itemList,
      ...this.persistentSelectedChildren,
    ];

    this.selectedChildren = this.selectedChildIds
      .map((id: number) => {
        return allAvailableChildren.find((child: Child) => child.id === id);
      })
      .filter(
        (child: Child | undefined): child is Child => child !== undefined
      );

    // Update persistent storage - keep all selected children
    this.selectedChildren.forEach((child) => {
      if (!this.persistentSelectedChildren.find((c) => c.id === child.id)) {
        this.persistentSelectedChildren.push(child);
      }
    });

    // Remove unselected children from persistent storage
    this.persistentSelectedChildren = this.persistentSelectedChildren.filter(
      (child) => this.selectedChildIds.includes(child.id)
    );
  }

  // Helper method to combine search results with selected children
  private combineWithSelectedChildren(searchResults: Child[]): Child[] {
    const combined = [...searchResults];

    // Add selected children that are not in search results
    this.selectedChildren.forEach((selectedChild: Child) => {
      if (!combined.find((child: Child) => child.id === selectedChild.id)) {
        combined.push(selectedChild);
      }
    });

    return combined;
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
    const allChildren = [...this.itemList, ...this.persistentSelectedChildren];
    const child = allChildren.find((c: Child) => c.id === id);
    return child?.name || '';
  }

  onFilterChange(search: string): void {
    this.searchValue = search;
    this.performSearch();
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchValue = target.value;

    // Clear existing timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // If search is empty, show persistent selected children
    if (!this.searchValue.trim()) {
      this.itemList = [...this.persistentSelectedChildren];
      this.filteredChildren = [...this.persistentSelectedChildren];
      return;
    }

    // Set new timeout for debouncing only when there's actual text
    this.searchTimeout = setTimeout(() => {
      this.performSearch();
    }, 500); // 500ms debounce
  }

  private performSearch(): void {
    this.loadChildren(this.searchValue);
  }

  clearFilter(): void {
    this.searchValue = '';
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    // Show persistent selected children when clearing search
    this.itemList = [...this.persistentSelectedChildren];
    this.filteredChildren = [...this.persistentSelectedChildren];
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
    const clickedChild = this.itemList.find((child) => child.id === id);

    if (current.includes(id)) {
      // Removing selection
      this.childrenControl.setValue(current.filter((i) => i !== id));
    } else {
      // Adding selection - make sure we preserve the child data
      if (
        clickedChild &&
        !this.persistentSelectedChildren.find((c) => c.id === id)
      ) {
        this.persistentSelectedChildren.push(clickedChild);
      }
      this.childrenControl.setValue([...current, id]);
    }
  }

  removeChild(id: number): void {
    const updated = this.selectedChildIds.filter((i) => i !== id);
    this.childrenControl.setValue(updated);

    // Remove from persistent storage as well
    this.persistentSelectedChildren = this.persistentSelectedChildren.filter(
      (child) => child.id !== id
    );
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

  onSearchKeydown(event: KeyboardEvent): void {
    // Allow space character in search input
    if (event.key === ' ' || event.code === 'Space') {
      event.stopPropagation();
    }

    // Prevent Enter key from closing the select dropdown
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
    }

    // Prevent Escape key from being handled by the select
    if (event.key === 'Escape' && this.searchValue) {
      event.stopPropagation();
      this.clearFilter();
    }
  }
}
