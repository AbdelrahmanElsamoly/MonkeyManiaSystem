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
    this.getAllBills(this.type, this.params);
  }

  getAllBills(type: string = '/', params: any) {
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
            IS_EDITED: item.returned_products.length > 0 ? '✅' : '❌',
            BILLS_ID: item.id,
            rawData: item, // Keep original data for reference
          };
        });

        this.totalItems = data.count || data.length || 0;
        this.currentPage = params.page;
      },
      error: (error) => {
        console.error('Error fetching cafe bills:', error);
        this.toaster.error(this.translate.instant('ERROR_FETCHING_BILLS'));
      },
    });
  }

  openBillDialog(productBillId: number): void {
    this.router.navigate(['/dashboard/cofe-bill', productBillId]);
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

  formatDateForAPI(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  goToBillProfile(bill: any) {
    this.router.navigate(['/dashboard/bills/cafe', bill.BILLS_ID]);
  }

  // openCloseBillDialog(item: any) {
  //   // You might need to create a getCafeBillById method in your service
  //   this.dashboardService
  //     .getCafeBillById(item.BILLS_ID)
  //     .subscribe({
  //       next: (res: any) => {
  //         const dialogRef = this.dialog.open(CloseBillDialogComponent, {
  //           data: res,
  //         });

  //         dialogRef.afterClosed().subscribe((result) => {
  //           if (result) {
  //             this.dashboardService
  //               .closeBill(item.BILLS_ID, result)
  //               .subscribe({
  //                 next: (res: any) => {
  //                   this.toaster.success(res.message);
  //                   this.router.navigate(['/dashboard/bills/cafe', item.BILLS_ID]);
  //                 },
  //                 error: (error) => {
  //                   console.error('Error closing bill:', error);
  //                   this.toaster.error(this.translate.instant('ERROR_CLOSING_BILL'));
  //                 }
  //               });
  //           }
  //         });
  //       },
  //       error: (error) => {
  //         console.error('Error fetching bill details:', error);
  //         this.toaster.error(this.translate.instant('ERROR_FETCHING_BILL_DETAILS'));
  //       }
  //     });
  // }

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
