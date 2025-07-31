import { Component, Inject } from '@angular/core';
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

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CloseBillDialogComponent>,
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

  updateRest(): void {
    const { visa, cash, instapay } = this.form.value;
    const paid = Number(visa) + Number(cash) + Number(instapay);
    this.rest = this.totalPrice - paid;
  }

  submit(): void {
    this.dialogRef.close(this.form.value); // Ex: { visa: 100, cash: 100, instapay: 0 }
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
