import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DashboardService } from 'src/app/dashboard/dashboard.service';
import { SharedService } from '../../shared.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-subscription-dialog',
  templateUrl: './subscription-dialog.component.html',
  styleUrls: ['./subscription-dialog.component.scss'],
})
export class SubscriptionDialogComponent implements OnInit {
  branches: any[] = [];
  isLoading = false;

  form = {
    name: '',
    hours: null as number | null,
    instance_duration: null as number | null,
    price: null as number | null,
    usable_in_branches: [] as number[],
    creatable_in_branches: [] as number[],
    is_active: true,
  };

  constructor(
    private dialogRef: MatDialogRef<SubscriptionDialogComponent>,
    private dashboardService: DashboardService,
    private sharedService: SharedService,
    private toaster: ToastrService,
    private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.loadBranches();
    if (this.data.isEdit && this.data.subscription) {
      const s = this.data.subscription;
      this.form.name = s.name;
      this.form.hours = parseFloat(s.hours);
      this.form.instance_duration = s.instance_duration;
      this.form.price = parseFloat(s.price);
      this.form.is_active = s.is_active;
    }
  }

  loadBranches() {
    this.sharedService.getBranches().subscribe({
      next: (res: any) => {
        this.branches = res;
        if (this.data.isEdit && this.data.subscription) {
          const s = this.data.subscription;
          this.form.usable_in_branches = this.branches
            .filter((b) => s.usable_in_branches?.includes(b.name))
            .map((b) => b.id);
          this.form.creatable_in_branches = this.branches
            .filter((b) => s.creatable_in_branches?.includes(b.name))
            .map((b) => b.id);
        }
      },
    });
  }

  get isFormValid(): boolean {
    return !!(
      this.form.name &&
      this.form.hours != null &&
      this.form.instance_duration != null &&
      this.form.price != null
    );
  }

  onSave() {
    if (!this.isFormValid) return;
    this.isLoading = true;

    const body: any = {
      name: this.form.name,
      hours: this.form.hours,
      instance_duration: this.form.instance_duration,
      price: this.form.price,
      usable_in_branches: this.form.usable_in_branches,
      creatable_in_branches: this.form.creatable_in_branches,
    };
    if (this.data.isEdit) {
      body.is_active = this.form.is_active;
    }

    const request$ = this.data.isEdit
      ? this.dashboardService.updateSubscription(this.data.id, body)
      : this.dashboardService.createSubscription(body);

    request$.subscribe({
      next: () => {
        this.isLoading = false;
        this.dialogRef.close(true);
      },
      error: () => {
        this.isLoading = false;
        this.toaster.error(this.translate.instant('ERROR'));
      },
    });
  }

  onClose() {
    this.dialogRef.close(false);
  }
}
