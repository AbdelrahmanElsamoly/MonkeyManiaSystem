import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DashboardService } from 'src/app/dashboard/dashboard.service';

@Component({
  selector: 'app-school-dialog',
  templateUrl: './school-dialog.component.html',
  styleUrls: ['./school-dialog.component.scss'],
})
export class SchoolDialogComponent {
  school = {
    name: '',
    address: '',
    notes: '',
  };

  constructor(
    private dialogRef: MatDialogRef<SchoolDialogComponent>,
    private dashBoardService: DashboardService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data) {
      this.school = { ...data }; // pre-fill from passed data
    }
  }

  onClose() {
    this.dialogRef.close();
  }

  onCreateSchool() {
    const payload = {
      name: this.school.name.trim(),
      address: this.school.address.trim(),
      notes: this.school.notes?.trim() || null,
    };

    this.dashBoardService.createSchool(payload).subscribe({
      next: (res) => {
        this.dialogRef.close(res); // Return result to parent
      },
      error: (err) => {
        console.error('Error creating school:', err);
        alert('حدث خطأ أثناء إضافة المدرسة');
      },
    });
  }

  checkIfEdit() {
    if (this.data && this.data.event === 'edit') {
      this.editSchool();
    } else {
      this.onCreateSchool();
    }
  }

  editSchool() {
    const payload = {
      name: this.school.name.trim(),
      address: this.school.address.trim(),
      notes: this.school.notes?.trim() || null,
    };

    this.dashBoardService.updateSchool(this.data.id, payload).subscribe({
      next: (res) => {
        this.dialogRef.close(res); // Return result to parent
      },
      error: (err) => {
        console.error('Error updating school:', err);
        alert('حدث خطأ أثناء تحديث المدرسة');
      },
    });
  }
}
