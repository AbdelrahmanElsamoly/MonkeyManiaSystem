import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CloseBillDialogComponent } from 'src/app/shared/components/close-bill-dialog/close-bill-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { CreateBillDialogComponent } from 'src/app/shared/components/create-bill-dialog/create-bill-dialog.component';
import { PromoCodeDialogComponent } from 'src/app/shared/components/promo-code-dialog/promo-code-dialog.component';

@Component({
  selector: 'app-children-bills',
  templateUrl: './children-bills.component.html',
  styleUrls: ['./children-bills.component.scss'],
})
export class ChildrenBillsComponent implements OnInit {
  userInfo = JSON.parse(localStorage.getItem('user') || '{}');
  isLoading = false; // Add loading state

  selectedDateRange: { start: Date | null; end: Date | null } = {
    start: null,
    end: null,
  };
  type: string = '/';
  totalItems = 0;
  currentPage = 1;
  selectedBranchIds: any[] = [];
  searchQuery: string = '';
  params: {
    searchQuery: string;
    branchIds: any[];
    startDate: Date | string | null;
    endDate: Date | string | null;
    page: number;
  } = {
    searchQuery: this.searchQuery,
    branchIds: this.selectedBranchIds,
    startDate: this.selectedDateRange.start
      ? this.formatDateForAPI(this.selectedDateRange.start)
      : null,
    endDate: this.selectedDateRange.end
      ? this.formatDateForAPI(this.selectedDateRange.end)
      : null,
    page: 1,
  };
  displayedColumns = [
    this.translate.instant('NAME'),
    this.translate.instant('PHONE_NUMBER'),
    this.translate.instant('SPENT_TIME'),
    this.translate.instant('CHILDREN_COUNT'),
    this.translate.instant('BRANCH'),
  ];
  billsRes: any[] = [];

  constructor(
    private dashboardService: DashboardService,
    private translate: TranslateService,
    private router: Router,
    private dialog: MatDialog,
    private toaster: ToastrService
  ) {}

  ngOnInit(): void {
    // Auto select last two days
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    this.selectedDateRange.start = yesterday;
    this.selectedDateRange.end = today;

    this.params.startDate = this.formatDateForAPI(yesterday);
    this.params.endDate = this.formatDateForAPI(today);

    this.getAllBills(this.type, this.params);
  }

  getAllBills(type: string = '/', params: any) {
    this.isLoading = true; // Start loading

    this.dashboardService.getChildrenBills(type, params).subscribe({
      next: (data: any) => {
        this.billsRes = data.results.map((item: any) => {
          return {
            NAME: item?.first_child,
            PHONE_NUMBER: item?.first_phone,
            SPENT_TIME: this.getSpentTimeFormatted(item.spent_time),
            BRANCH: item.branch,
            BILLS_ID: item.id,
            isActive: item.is_active,
            DISCOUNT_VALUE: Number(item.discount_value),
            CHILDREN_COUNT: item.children_count,
          };
        });
        this.totalItems = data.count;
        this.currentPage = params.page;
        this.isLoading = false; // Stop loading
      },
      error: (error) => {
        console.error('Error fetching bills:', error);
        this.isLoading = false; // Stop loading on error
      },
    });
  }

  getSpentTimeFormatted(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    const hoursPart = hours > 0 ? `${hours} ساعة` : '';
    const minutesPart = remainingMinutes > 0 ? `${remainingMinutes} دقيقة` : '';

    if (hoursPart && minutesPart) return `${hoursPart} و${minutesPart}`;
    return hoursPart || minutesPart || '0 دقيقة';
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
        searchQuery: this.searchQuery,
        branchIds: this.selectedBranchIds,
        startDate: this.formatDateForAPI(start),
        endDate: this.formatDateForAPI(end),
        page: 1,
      };
      this.getAllBills(this.type, this.params);
    }
  }

  searchExpense(searchQuery: string) {
    this.params = {
      searchQuery: searchQuery,
      branchIds: this.selectedBranchIds,
      startDate: this.selectedDateRange.start
        ? this.formatDateForAPI(this.selectedDateRange.start)
        : null,
      endDate: this.selectedDateRange.end
        ? this.formatDateForAPI(this.selectedDateRange.end)
        : null,
      page: 1,
    };

    this.getAllBills(this.type, this.params);
  }

  onBranchSelectionChange(selected: any) {
    this.selectedBranchIds = selected;
    this.params = {
      searchQuery: this.searchQuery,
      branchIds: this.selectedBranchIds,
      startDate: this.selectedDateRange.start
        ? this.formatDateForAPI(this.selectedDateRange.start)
        : null,
      endDate: this.selectedDateRange.end
        ? this.formatDateForAPI(this.selectedDateRange.end)
        : null,
      page: 1,
    };
    this.getAllBills(this.type, this.params);
  }

  getDateRangeInArabic(): string {
    if (!this.selectedDateRange.start || !this.selectedDateRange.end) {
      return '';
    }

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

    const startDay = arabicDays[this.selectedDateRange.start.getDay()];
    const startDate = this.selectedDateRange.start.getDate();
    const startMonth = arabicMonths[this.selectedDateRange.start.getMonth()];
    const startYear = this.selectedDateRange.start.getFullYear();

    const endDay = arabicDays[this.selectedDateRange.end.getDay()];
    const endDate = this.selectedDateRange.end.getDate();
    const endMonth = arabicMonths[this.selectedDateRange.end.getMonth()];
    const endYear = this.selectedDateRange.end.getFullYear();

    return `من ${startDay} ${startDate} ${startMonth} ${startYear} إلى ${endDay} ${endDate} ${endMonth} ${endYear}`;
  }

  formatDateForAPI(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  goToBillProfile(bill: any) {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/dashboard/bills/child', bill.BILLS_ID])
    );
    window.open(url, '_blank');
  }

  openCloseBillDialog(item: any) {
    this.dashboardService
      .getChildBillById(item.BILLS_ID)
      .subscribe((res: any) => {
        const dialogRef = this.dialog.open(CloseBillDialogComponent, {
          data: res,
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.dashboardService
              .closeBill(item.BILLS_ID, result)
              .subscribe((res: any) => {
                this.toaster.success(res.message);
                const url = this.router.serializeUrl(
                  this.router.createUrlTree([
                    '/dashboard/bills/child',
                    item.BILLS_ID,
                  ])
                );
                window.open(url, '_blank');
              });
          }
        });
      });
  }

  pageChanged(page: number) {
    this.params.page = page;
    this.getAllBills(this.type, this.params);
  }

  openCreateBillDialog(): void {
    const dialogRef = this.dialog.open(CreateBillDialogComponent, {
      width: '90vw',
      maxWidth: '1200px',
      height: 'auto',
      maxHeight: '90vh',
      disableClose: true,
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getAllBills(this.type, this.params);
      }
    });
  }

  openPromoDialog(bill: any): void {
    const dialogRef = this.dialog.open(PromoCodeDialogComponent, {
      width: '500px',
      disableClose: false,
      data: { billId: bill.BILLS_ID },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success) {
        this.getAllBills(this.type, this.params);
      }
    });
  }
}
