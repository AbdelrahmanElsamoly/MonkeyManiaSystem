import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DashboardService } from 'src/app/dashboard/dashboard.service';
import { ToastrService } from 'ngx-toastr';

interface Product {
  name: string;
  unit_price: string;
  total_price: number;
  quantity: number;
  ordered_quantity: number; // Original ordered quantity
  counter: number; // Counter that starts at 0
  notes: string;
  product_id?: number;
}

interface BillData {
  id: number;
  bill_number: number;
  table_number: number;
  total_price: string;
  take_away: boolean;
  bill: number;
  products: Product[];
  returned_products: any[];
  created_by: number;
  created: string;
  updated: string;
}

@Component({
  selector: 'app-bill-dialog',
  templateUrl: './bill-dialog.component.html',
  styleUrls: ['./bill-dialog.component.scss'],
})
export class BillDialogComponent implements OnInit {
  billData: BillData | null = null;
  products: Product[] = [];
  isLoading: boolean = true;
  isUpdating: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<BillDialogComponent>,
    private dashboardService: DashboardService,
    private toaster: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: { billId: number }
  ) {}

  ngOnInit() {
    this.loadBillData();
  }

  loadBillData() {
    this.isLoading = true;
    this.dashboardService.getBillDetails(this.data.billId).subscribe({
      next: (res: any) => {
        this.billData = res;
        // Create a copy of products for editing with counter logic
        this.products = res.products.map((product: any, index: number) => ({
          ...product,
          product_id: product.id,
          ordered_quantity: product.quantity, // Store original quantity
          counter: 0, // Initialize counter to 0
          quantity: product.quantity, // Keep original for display
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load bill data:', err);
        this.toaster.error('Failed to load bill data');
        this.isLoading = false;
        this.onClose();
      },
    });
  }

  increaseCounter(index: number) {
    const product = this.products[index];
    if (product.counter < product.ordered_quantity) {
      product.counter++;
      this.updateProductTotal(index);
    }
  }

  decreaseCounter(index: number) {
    const product = this.products[index];
    if (product.counter > 0) {
      product.counter--;
      this.updateProductTotal(index);
    }
  }

  onCounterChange(index: number, event: Event) {
    const target = event.target as HTMLInputElement;
    const newCounter = parseInt(target.value) || 0;
    const product = this.products[index];

    if (newCounter >= 0 && newCounter <= product.ordered_quantity) {
      product.counter = newCounter;
      this.updateProductTotal(index);
    } else if (newCounter > product.ordered_quantity) {
      // Reset to max allowed if exceeds ordered quantity
      product.counter = product.ordered_quantity;
      target.value = product.ordered_quantity.toString();
      this.updateProductTotal(index);
    } else {
      // Reset to 0 if invalid input
      product.counter = 0;
      target.value = '0';
      this.updateProductTotal(index);
    }
  }

  // Check if there are any changes made to quantities
  hasChanges(): boolean {
    return this.products.some((product) => product.counter > 0);
  }

  private updateProductTotal(index: number) {
    const product = this.products[index];
    const unitPrice = parseFloat(product.unit_price);
    // Calculate total based on counter, not original quantity
    product.total_price = unitPrice * product.counter;
  }

  getTotalBillPrice(): number {
    return this.products.reduce(
      (total, product) => total + product.total_price,
      0
    );
  }

  // Check if decrease button should be disabled
  isDecreaseDisabled(index: number): boolean {
    return this.products[index].counter <= 0;
  }

  // Check if increase button should be disabled
  isIncreaseDisabled(index: number): boolean {
    const product = this.products[index];
    return product.counter >= product.ordered_quantity;
  }

  onSubmit() {
    if (!this.billData) return;

    this.isUpdating = true;

    // Only include products with counter > 0
    const productsToUpdate = this.products
      .filter((product) => product.counter > 0)
      .map((product) => ({
        product_type: 'product',
        product_id: product.product_id,
        quantity: product.counter, // Use counter instead of quantity
        notes: product.notes,
      }));

    const payload = {
      returned_products: productsToUpdate,
      bill: this.data.billId,
      table_number: this.billData.table_number,
      take_away: this.billData.take_away,
    };

    console.log('Payload:', payload); // For debugging

    this.dashboardService.updateBill(this.data.billId, payload).subscribe({
      next: (res: any) => {
        this.toaster.success('Bill updated successfully');
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Update Error:', err);
        this.toaster.error('Failed to update bill');
        this.isUpdating = false;
      },
    });
  }

  onClose() {
    this.dialogRef.close();
  }
}
