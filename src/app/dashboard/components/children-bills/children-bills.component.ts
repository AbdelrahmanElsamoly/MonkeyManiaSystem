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
  selectedDateRange: { start: Date | null; end: Date | null } = {
    start: null,
    end: null,
  };
  type: string = '/';
  selectedBranchIds: any[] = [];
  searchQuery: string = '';
  params: {
    searchQuery: string;
    branchIds: any[];
    startDate: Date | string | null;
    endDate: Date | string | null;
  } = {
    searchQuery: this.searchQuery,
    branchIds: this.selectedBranchIds,
    startDate: this.selectedDateRange.start
      ? this.formatDateForAPI(this.selectedDateRange.start)
      : null,
    endDate: this.selectedDateRange.end
      ? this.formatDateForAPI(this.selectedDateRange.end)
      : null,
  };
  displayedColumns = [
    this.translate.instant('NAME'),
    this.translate.instant('PHONE_NUMBER'),
    this.translate.instant('SPENT_TIME'),
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
    this.getAllBills(this.type, this.params);
  }
  getAllBills(type: string = '/', params: any) {
    this.dashboardService.getChildrenBills(type, params).subscribe({
      next: (data: any) => {
        this.billsRes = data.map((item: any) => {
          const firstChild = item.children[0];
          const firstPhone = firstChild?.phone_numbers?.[0]?.phone_number ?? '';
          return {
            NAME: firstChild?.name,
            PHONE_NUMBER: firstPhone,
            SPENT_TIME: item.spent_time,
            BRANCH: item.branch,
            BILLS_ID: item.id,
            isActive: item.is_active,
            DISCOUNT_VALUE: item.discount_value,
          };
        });
      },
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

  checkAndTrigger(): void {
    const { start, end } = this.selectedDateRange;

    if (start && end) {
      this.params = {
        searchQuery: this.searchQuery,
        branchIds: this.selectedBranchIds,
        startDate: this.formatDateForAPI(start),
        endDate: this.formatDateForAPI(end),
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
    this.router.navigate(['/dashboard/bills/child', bill.BILLS_ID]);
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
                this.router.navigate(['/dashboard/bills/child', item.BILLS_ID]);
              });
          }
        });
      });
  }
  openCreateBillDialog(): void {
    const dialogRef = this.dialog.open(CreateBillDialogComponent, {
      width: '500px',
      data: {
        // you can pass data here if needed
      },
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
        // Handle success - maybe refresh the bill data, show success message, etc.
        this.getAllBills(this.type, this.params);
      } else {
      }
    });
  }
}
