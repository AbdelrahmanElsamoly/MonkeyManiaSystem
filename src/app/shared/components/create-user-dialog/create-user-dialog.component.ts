import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DashboardService } from 'src/app/dashboard/dashboard.service';
import { SharedService } from 'src/app/shared/shared.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-user-dialog',
  templateUrl: './create-user-dialog.component.html',
  styleUrls: ['./create-user-dialog.component.scss'],
})
export class CreateUserDialogComponent implements OnInit {
  currentBranch = JSON.parse(localStorage.getItem('branch') || 'null') || {};
  roles = ['admin', 'manager', 'reception', 'waiter'];
  branches: any[] = [];
  hidePassword = true;
  hideConfirm = true;

  form: any = {
    username: '',
    phone_number: '',
    email: '',
    branch: null,
    role: '',
    is_active: true,
    password: '',
    confirm_password: '',
  };

  constructor(
    private dialogRef: MatDialogRef<CreateUserDialogComponent>,
    private dashboardService: DashboardService,
    private sharedService: SharedService,
    private toaster: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  get isEdit(): boolean {
    return !!this.data?.isEdit;
  }

  ngOnInit(): void {
    this.sharedService.getBranches().subscribe((res: any) => {
      this.branches = res;
    });

    if (this.isEdit && this.data.user) {
      const u = this.data.user;
      this.form.username = u.username ?? '';
      this.form.phone_number = u.phone_number ?? '';
      this.form.email = u.email ?? '';
      this.form.role = u.role ?? '';
      this.form.is_active = u.is_active ?? true;
      this.form.branch = u.branch_id ?? this.currentBranch?.id ?? null;
    } else {
      this.form.branch = this.currentBranch?.id ?? null;
    }
  }

  onSave() {
    if (!this.isEdit || this.form.password) {
      if (this.form.password !== this.form.confirm_password) {
        this.toaster.error('كلمة المرور غير متطابقة');
        return;
      }
    }

    const body: any = {
      username: this.form.username,
      phone_number: this.form.phone_number,
      role: this.form.role,
      is_active: this.form.is_active,
    };

    if (this.form.email) {
      body.email = this.form.email;
    }

    if (this.form.branch) {
      body.branch = this.form.branch;
    }

    if (this.form.password) {
      body.password = this.form.password;
      body.confirm_password = this.form.confirm_password;
    }

    if (this.isEdit) {
      this.dashboardService.updateUser(this.data.user.id, body).subscribe({
        next: (res: any) => {
          this.toaster.success(res.message || 'تم تحديث المستخدم بنجاح');
          this.dialogRef.close(true);
        },
        error: (err: any) => {
          const msg = err?.error?.message || 'حدث خطأ';
          this.toaster.error(msg);
        },
      });
    } else {
      if (!this.form.password) {
        this.toaster.error('كلمة المرور مطلوبة');
        return;
      }
      body.password = this.form.password;
      body.confirm_password = this.form.confirm_password;
      this.dashboardService.createUser(body).subscribe({
        next: (res: any) => {
          this.toaster.success(res.message || 'تم إنشاء المستخدم بنجاح');
          this.dialogRef.close(true);
        },
        error: (err: any) => {
          const msg = err?.error?.message || 'حدث خطأ';
          this.toaster.error(msg);
        },
      });
    }
  }

  onClose() {
    this.dialogRef.close(false);
  }
}
