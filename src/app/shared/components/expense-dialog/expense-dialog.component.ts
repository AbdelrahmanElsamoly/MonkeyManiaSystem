import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SharedService } from '../../shared.service';
import { DashboardService } from 'src/app/dashboard/dashboard.service';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-expense-dialog',
  templateUrl: './expense-dialog.component.html',
  styleUrls: ['./expense-dialog.component.scss'],
})
export class ExpenseDialogComponent implements OnInit {
  type: 'general' | 'material';
  branches: any[] = [];
  branch = JSON.parse(localStorage.getItem('branch') || '{}');
  materials: any[] = [];
  filteredMaterials: any[] = [];
  selectedMaterialId: any;

  selectedMaterialName: string = '';

  expense: any = {
    id: null,
    name: '',
    material: null,
    branch: null,
    total_price: null,
    quantity: null,
  };

  constructor(
    private dialogRef: MatDialogRef<ExpenseDialogComponent>,
    private sharedService: SharedService,
    private dashboardService: DashboardService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private toaster: ToastrService
  ) {
    this.type = data.type;
  }

  ngOnInit(): void {
    if (this.type === 'general') {
      this.loadBranches();
    } else if (this.type === 'material') {
      this.getMaterials();
    }

    // ✅ Pre-fill data in edit mode
    if (this.data.isEdit && this.data.expense) {
      this.expense = { ...this.data.expense };
      if (this.type === 'general') {
        // ✅ Make sure branch is the ID
        this.expense.branch = this.data.branchId;
      }

      if (this.type === 'material') {
        this.getMaterials();
        this.selectedMaterialName = this.expense.material;
        this.selectedMaterialId = this.data.materialId;
      }
    }
  }

  loadBranches() {
    this.sharedService.getBranches().subscribe({
      next: (res: any) => (this.branches = res),
    });
  }

  onSave() {
    if (this.data.isEdit) {
      // ✅ EDIT MODE
      if (this.type === 'general') {
        this.dashboardService
          .updateGeneralExpense(this.data.id, this.expense)
          .subscribe((res: any) => {
            this.toaster.success(res.message);
            this.dialogRef.close(true);
          });
      } else {
        const body = {
          material: this.selectedMaterialId,
          total_price: this.expense.total_price,
          quantity: this.expense.quantity,
        };
        this.dashboardService
          .updateMaterialExpense(this.data.id, body)
          .subscribe((res: any) => {
            this.toaster.success(res.message);
            this.dialogRef.close(true);
          });
      }
    } else {
      // ✅ CREATE MODE
      if (this.type === 'general') {
        this.dashboardService
          .createGeneralExpense(this.expense)
          .subscribe((res: any) => {
            this.toaster.success(res.message);
            this.dialogRef.close(true);
          });
      } else {
        const body = {
          material: this.selectedMaterialId,
          total_price: this.expense.total_price,
          quantity: this.expense.quantity,
        };
        this.dashboardService
          .createMaterialExpense(body)
          .subscribe((res: any) => {
            this.toaster.success(res.message);
            this.dialogRef.close(true);
          });
      }
    }
  }

  getMaterials() {
    this.sharedService.getMaterials(this.branch.id).subscribe((res: any) => {
      this.materials = res;
      this.filteredMaterials = res;
    });
  }

  filterMaterials(event: Event) {
    const inputValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredMaterials = this.materials.filter((mat) =>
      mat.name.toLowerCase().includes(inputValue)
    );
  }

  selectMaterial(event: MatAutocompleteSelectedEvent) {
    const selectedName = event.option.value;
    this.selectedMaterialName = selectedName;
    const selectedObject = this.materials.find((m) => m.name === selectedName);
    if (selectedObject) {
      this.selectedMaterialId = selectedObject.id;
    }
  }

  onClose() {
    this.dialogRef.close(false);
  }
}
