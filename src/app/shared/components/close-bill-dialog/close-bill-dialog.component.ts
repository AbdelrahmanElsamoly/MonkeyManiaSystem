import {
  Component,
  Inject,
  ElementRef,
  ViewChild,
  Renderer2,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-close-bill-dialog',
  templateUrl: './close-bill-dialog.component.html',
  styleUrls: ['./close-bill-dialog.component.scss'],
})
export class CloseBillDialogComponent {
  form: FormGroup;
  rest: number = 0;
  totalPrice: number;
  isProductBillsExpanded: boolean = false;
  isTransitioning: boolean = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CloseBillDialogComponent>,
    private renderer: Renderer2,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.totalPrice = data.total_price;
    this.form = this.fb.group({
      visa: [0],
      cash: [0],
      instapay: [0],
    });
    this.updateRest();
  }

  toggleProductBills(): void {
    if (this.isTransitioning) return;

    this.isTransitioning = true;
    this.isProductBillsExpanded = !this.isProductBillsExpanded;

    // Add expanding class for button animation
    const expandBtn = document.querySelector('.expand-emoji-btn');
    if (expandBtn) {
      this.renderer.addClass(expandBtn, 'expanding');
      setTimeout(() => {
        this.renderer.removeClass(expandBtn, 'expanding');
      }, 300);
    }

    // Reset transition flag after animation completes
    setTimeout(() => {
      this.isTransitioning = false;
    }, 500);
  }

  getDisplayedProductBills(): any[] {
    if (
      !this.data.product_bills_set ||
      this.data.product_bills_set.length === 0
    ) {
      return [];
    }
    if (this.data.product_bills_set.length <= 3) {
      return this.data.product_bills_set;
    }
    return this.isProductBillsExpanded
      ? this.data.product_bills_set
      : this.data.product_bills_set.slice(0, 3);
  }

  updateRest(): void {
    const { visa, cash, instapay } = this.form.value;
    const paid = Number(visa) + Number(cash) + Number(instapay);
    this.rest = this.totalPrice - paid;
  }

  submit(): void {
    this.dialogRef.close(this.form.value);
  }

  onClose(): void {
    this.dialogRef.close();
  }

  getSpentTimeFormatted(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    const hoursPart = hours > 0 ? `${hours} ساعة` : '';
    const minutesPart = remainingMinutes > 0 ? `${remainingMinutes} دقيقة` : '';
    if (hoursPart && minutesPart) return `${hoursPart} و${minutesPart}`;
    return hoursPart || minutesPart || '0 دقيقة';
  }
}
