import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { PromoCodeDialogComponent } from 'src/app/shared/components/promo-code-dialog/promo-code-dialog.component';
import { BillDialogComponent } from 'src/app/shared/components/bill-dialog/bill-dialog.component';

@Component({
  selector: 'app-cafe-bills',
  templateUrl: './cafe-bills.component.html',
  styleUrls: ['./cafe-bills.component.scss'],
})
export class CafeBillsComponent implements OnInit {
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
    'TABLE_NUMBER',
    'TOTAL_PRICE',
    'TAKE_AWAY',
    'FIRST_CHILD',
    'IS_EDITED',
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

    this.dashboardService.getCafeBill(type, params).subscribe({
      next: (data: any) => {
        this.billsRes = data.results.map((item: any) => {
          return {
            BILL_NUMBER: item.bill_number,
            TABLE_NUMBER: item.table_number,
            TOTAL_PRICE: `${item.total_price} ${this.translate.instant('EGP')}`,
            TAKE_AWAY: item.take_away ? 'تيك أواي 🥡' : 'في المطعم 🍽️',
            FIRST_CHILD: item.first_child,
            CREATED_DATE: this.formatDisplayDate(item.created),
            IS_EDITED: item?.returned_products?.length > 0 ? '✅' : '❌',
            BILLS_ID: item.id,
            rawData: item, // Keep original data for reference
          };
        });

        this.totalItems = data.count || data.length || 0;
        this.currentPage = params.page;
        this.isLoading = false; // Stop loading
      },
      error: (error) => {
        console.error('Error fetching cafe bills:', error);
        this.toaster.error(this.translate.instant('ERROR_FETCHING_BILLS'));
        this.isLoading = false; // Stop loading on error
      },
    });
  }

  openBillDialog(productBillId: number): void {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/dashboard/cofe-bill', productBillId])
    );
    window.open(url, '_blank');
  }

  formatDisplayDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  onStartDateChange(date: Date): void {
    this.selectedDateRange.start = date;
    this.checkAndTrigger();
  }

  onEndDateChange(date: Date): void {
    this.selectedDateRange.end = date;
    this.checkAndTrigger();
  }

  openUpdateBillDialog(billId: number) {
    const dialogRef = this.dialog.open(BillDialogComponent, {
      data: { billId: billId },
      width: '90vw',
      maxWidth: '900px',
      height: 'auto',
      maxHeight: '50vh',
      disableClose: false,
      panelClass: 'custom-dialog-panel', // Optional: for additional styling
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Dialog was closed with success (bill was updated)
        console.log('Bill updated successfully');
        // Refresh your bills list or update the specific bill
        this.getAllBills(this.type, this.params); // Implement this method as needed
      }
    });
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
      this.router.createUrlTree(['/dashboard/bills/cafe', bill.BILLS_ID])
    );
    window.open(url, '_blank');
    console.log('shhsjdfudjsfgj');
  }

  pageChanged(page: number) {
    this.params.page = page;
    this.getAllBills(this.type, this.params);
  }

  openPromoDialog(bill: any): void {
    const dialogRef = this.dialog.open(PromoCodeDialogComponent, {
      width: '500px',
      disableClose: false,
      data: {
        billId: bill.BILLS_ID,
        billType: 'cafe',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success) {
        this.getAllBills(this.type, this.params);
        this.toaster.success(
          this.translate.instant('PROMO_CODE_APPLIED_SUCCESS')
        );
      }
    });
  }

  makeOrder() {
    this.router.navigate(['/dashboard/order']);
  }
}
