import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { SharedService } from '../../shared.service';
import { ToastrService } from 'ngx-toastr';

export interface PromoDialogData {
  billId: number;
}

@Component({
  selector: 'app-promo-code-dialog',
  templateUrl: './promo-code-dialog.component.html',
  styleUrls: ['./promo-code-dialog.component.scss'],
})
export class PromoCodeDialogComponent implements OnInit {
  promoForm!: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public dialogRef: MatDialogRef<PromoCodeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PromoDialogData,
    private sharedService: SharedService,
    private toaster: ToastrService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.promoForm = this.fb.group({
      discount: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  onSubmit(): void {
    if (this.promoForm.valid && !this.isLoading) {
      this.applyPromoCode();
    }
  }

  private applyPromoCode(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const promoCode = this.promoForm.get('discount')?.value;

    const requestBody = {
      discount: promoCode,
    };
    this.sharedService.ApplyPromoCode(this.data.billId, promoCode).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.successMessage = 'Promo code applied successfully!';
        this.toaster.success(response.message);
        this.dialogRef.close({ success: true, response });
      },
      error: (error) => {
        // Auto-clear error message after 5 seconds
      },
    });
  }

  onClose(): void {
    this.dialogRef.close({ success: false });
  }

  // Clear messages when user starts typing
  onPromoCodeChange(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
