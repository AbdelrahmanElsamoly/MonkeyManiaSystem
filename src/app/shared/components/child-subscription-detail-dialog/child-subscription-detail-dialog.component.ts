import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-child-subscription-detail-dialog',
  templateUrl: './child-subscription-detail-dialog.component.html',
  styleUrls: ['./child-subscription-detail-dialog.component.scss'],
})
export class ChildSubscriptionDetailDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<ChildSubscriptionDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onClose() {
    this.dialogRef.close();
  }
}
