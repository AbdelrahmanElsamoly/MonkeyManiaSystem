import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from 'src/app/shared/shared.service';
import { ChildSubscriptionDialogComponent } from 'src/app/shared/components/child-subscription-dialog/child-subscription-dialog.component';
import { ChildSubscriptionDetailDialogComponent } from 'src/app/shared/components/child-subscription-detail-dialog/child-subscription-detail-dialog.component';

@Component({
  selector: 'app-child-subscription',
  templateUrl: './child-subscription.component.html',
  styleUrls: ['./child-subscription.component.scss'],
})
export class ChildSubscriptionComponent implements OnInit {
  isLoading = false;
  instances: any[] = [];
  branches: any[] = [];
  selectedBranchIds: number[] = [];
  isAdminOrOwner = false;

  selectedDateRange: { start: Date | null; end: Date | null } = {
    start: null,
    end: null,
  };

  params: {
    branchIds: number[];
    startDate: string | null;
    endDate: string | null;
  } = {
    branchIds: [],
    startDate: null,
    endDate: null,
  };

  displayedColumns = [
    'CHILD',
    'SUBSCRIPTION',
    'BRANCH',
    'CASH',
    'VISA',
    'INSTAPAY',
    'PRICE',
    'HOURS',
    'EXPIRE_DATE',
    'IS_ACTIVE',
    'REMAINING_HOURS',
  ];

  constructor(
    private dashboardService: DashboardService,
    private sharedService: SharedService,
    private translate: TranslateService,
    private dialog: MatDialog,
    private toaster: ToastrService,
  ) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.isAdminOrOwner = user.role === 'admin' || user.role === 'owner';

    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);

    this.selectedDateRange.start = lastMonth;
    this.selectedDateRange.end = today;
    this.params.startDate = this.formatDateForAPI(lastMonth);
    this.params.endDate = this.formatDateForAPI(today);

    if (this.isAdminOrOwner) {
      this.sharedService.getBranches().subscribe({
        next: (res: any) => {
          this.branches = res;
        },
      });
    }

    this.loadInstances();
  }

  loadInstances() {
    this.isLoading = true;
    this.dashboardService.getAllSubscriptionInstances(this.params).subscribe({
      next: (res: any) => {
        this.instances = res.results.map((item: any) => ({
          CHILD: item.child,
          SUBSCRIPTION: item.subscription,
          BRANCH: item.branch,
          CASH: item.cash,
          VISA: item.visa,
          INSTAPAY: item.instapay,
          PRICE: `${item.price} ${this.translate.instant('EGP')}`,
          HOURS: item.base_hours,
          EXPIRE_DATE: item.expire_date,
          IS_ACTIVE: item.is_active ? '✅' : '❌',
          ID: item.id,
          rawData: item,
          REMAINING_HOURS: item.remaining_hours,
        }));
        this.isLoading = false;
      },
      error: () => {
        this.toaster.error(
          this.translate.instant('ERROR_FETCHING_CHILD_SUBSCRIPTIONS'),
        );
        this.isLoading = false;
      },
    });
  }

  onBranchChange(branchIds: number[]) {
    this.selectedBranchIds = branchIds;
    this.params = { ...this.params, branchIds };
    this.loadInstances();
  }

  onStartDateChange(date: Date): void {
    this.selectedDateRange.start = date;
    this.checkAndTrigger();
  }

  onEndDateChange(date: Date): void {
    this.selectedDateRange.end = date;
    this.checkAndTrigger();
  }

  checkAndTrigger(): void {
    const { start, end } = this.selectedDateRange;
    if (start && end) {
      this.params = {
        ...this.params,
        startDate: this.formatDateForAPI(start),
        endDate: this.formatDateForAPI(end),
      };
      this.loadInstances();
    }
  }

  openCreateDialog() {
    const branch = JSON.parse(localStorage.getItem('branch') || '{}');
    const dialogRef = this.dialog.open(ChildSubscriptionDialogComponent, {
      width: '600px',
      data: { isEdit: false, branchId: branch.id ?? null },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.toaster.success(
          this.translate.instant('CHILD_SUBSCRIPTION_CREATED'),
        );
        this.loadInstances();
      }
    });
  }

  openEditDialog(row: any) {
    this.dashboardService.getSubscriptionInstanceById(row.ID).subscribe({
      next: (details: any) => {
        const dialogRef = this.dialog.open(ChildSubscriptionDialogComponent, {
          width: '600px',
          data: { isEdit: true, instance: details, id: details.id },
        });
        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.toaster.success(
              this.translate.instant('CHILD_SUBSCRIPTION_UPDATED'),
            );
            this.loadInstances();
          }
        });
      },
      error: () => {
        this.toaster.error(this.translate.instant('ERROR'));
      },
    });
  }

  onRowClick(row: any) {
    this.dashboardService.getSubscriptionInstanceById(row.ID).subscribe({
      next: (details: any) => {
        this.dialog.open(ChildSubscriptionDetailDialogComponent, {
          width: '500px',
          data: details,
        });
      },
      error: () => {
        this.toaster.error(this.translate.instant('ERROR'));
      },
    });
  }

  getDateRangeInArabic(): string {
    if (!this.selectedDateRange.start || !this.selectedDateRange.end) return '';
    const arabicDays = [
      'الأحد',
      'الاثنين',
      'الثلاثاء',
      'الأربعاء',
      'الخميس',
      'الجمعة',
      'السبت',
    ];
    const arabicMonths = [
      'يناير',
      'فبراير',
      'مارس',
      'أبريل',
      'مايو',
      'يونيو',
      'يوليو',
      'أغسطس',
      'سبتمبر',
      'أكتوبر',
      'نوفمبر',
      'ديسمبر',
    ];
    const s = this.selectedDateRange.start;
    const e = this.selectedDateRange.end;
    return `من ${arabicDays[s.getDay()]} ${s.getDate()} ${arabicMonths[s.getMonth()]} ${s.getFullYear()} إلى ${arabicDays[e.getDay()]} ${e.getDate()} ${arabicMonths[e.getMonth()]} ${e.getFullYear()}`;
  }

  formatDateForAPI(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }
}
