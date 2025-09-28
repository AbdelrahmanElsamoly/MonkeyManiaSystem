import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { DashboardService } from 'src/app/dashboard/dashboard.service';

@Component({
  selector: 'app-edit-bill-dialog',
  templateUrl: './edit-bill-dialog.component.html',
  styleUrls: ['./edit-bill-dialog.component.scss'],
})
export class EditBillDialogComponent implements OnInit {
  form: FormGroup;
  rest: number = 0;
  isProductBillsExpanded: boolean = false;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditBillDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dashboardService: DashboardService,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {
    this.form = this.fb.group({
      time_price: [0, [Validators.required, Validators.min(0)]],
      visa: [0, [Validators.required, Validators.min(0)]],
      cash: [0, [Validators.required, Validators.min(0)]],
      instapay: [0, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    this.initializeForm();
    this.updateRest();
  }

  initializeForm(): void {
    // Initialize form with existing values if available, ensuring they're numbers
    this.form.patchValue({
      time_price: Number(this.data.time_price) || 0,
      visa: Number(this.data.visa) || 0,
      cash: Number(this.data.cash) || 0,
      instapay: Number(this.data.instapay) || 0,
    });
  }

  updateRest(): void {
    const formValues = this.form.value;
    const totalPayments =
      (Number(formValues.time_price) || 0) +
      (Number(formValues.visa) || 0) +
      (Number(formValues.cash) || 0) +
      (Number(formValues.instapay) || 0);

    this.rest = (Number(this.data.total_price) || 0) - totalPayments;
  }

  onInputChange(fieldName: string, event: any): void {
    const value = Number(event.target.value) || 0;
    this.form.patchValue({ [fieldName]: value });
    this.updateRest();
  }

  getSpentTimeFormatted(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    const hoursPart = hours > 0 ? `${hours} ساعة` : '';
    const minutesPart = remainingMinutes > 0 ? `${remainingMinutes} دقيقة` : '';

    if (hoursPart && minutesPart) return `${hoursPart} و${minutesPart}`;
    return hoursPart || minutesPart || '0 دقيقة';
  }

  toggleProductBills(): void {
    this.isProductBillsExpanded = !this.isProductBillsExpanded;
  }

  onClose(): void {
    this.dialogRef.close();
  }

  submit(): void {
    this.isLoading = true;
    const body = {
      time_price: Number(this.form.value.time_price) || 0,
      visa: Number(this.form.value.visa) || 0,
      cash: Number(this.form.value.cash) || 0,
      instapay: Number(this.form.value.instapay) || 0,
    };

    this.dashboardService.updateCalculations(this.data.id, body).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.dialogRef.close(true);
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error updating calculations:', error);
      },
    });
  }
}
