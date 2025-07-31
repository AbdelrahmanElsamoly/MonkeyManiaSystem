import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ExpenseDialogComponent } from 'src/app/shared/components/expense-dialog/expense-dialog.component';

@Component({
  selector: 'app-general-expense',
  templateUrl: './general-expense.component.html',
  styleUrls: ['./general-expense.component.scss'],
})
export class GeneralExpenseComponent implements OnInit {
  selectedDateRange: { start: Date | null; end: Date | null } = {
    start: null,
    end: null,
  };
  type: string = 'general_expense';
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
    this.translate.instant('TOTAL_PRICE'),
    this.translate.instant('QUANTITY'),
    this.translate.instant('BRANCH'),
  ];
  expenseRes: any[] = [];
  constructor(
    private dashboardService: DashboardService,
    private translate: TranslateService,
    private router: Router,
    private dialog: MatDialog
  ) {}
  ngOnInit(): void {
    this.getGeneralExpense(this.type, this.params);
  }
  getGeneralExpense(type: string = 'general_expense', params: any) {
    this.dashboardService.getExpenses(type, params).subscribe({
      next: (data: any) => {
        console.log(data);
        this.expenseRes = data.map((item: any) => ({
          Name: item.name,
          TOTAL_PRICE: item.total_price,
          QUANTITY: item.quantity,
          BRANCH: item.branch,
          ID: item.id,
          BRANCH_ID: item.branch_id,
        }));
      },
    });
  }
  editExpense(expense: any) {
    const body = {
      name: expense.Name,
      branch: expense.BRANCH,
      total_price: expense.TOTAL_PRICE,
      quantity: expense.QUANTITY,
    };
    console.log(body);
    const dialogRef = this.dialog.open(ExpenseDialogComponent, {
      width: '500px',
      data: {
        type: 'general',
        branchId: expense.BRANCH_ID,
        isEdit: true, // Edit mode flag
        expense: body, // Pass existing expense data
        id: expense.ID,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getGeneralExpense(this.type, this.params); // reload after update
      }
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
      this.getGeneralExpense(this.type, this.params);
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
    console.log(this.params);
    this.getGeneralExpense(this.type, this.params);
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
    this.getGeneralExpense(this.type, this.params);
  }

  formatDateForAPI(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }
  goToExpenseProfile(expense: any) {
    this.router.navigate(['/dashboard/expense', expense.ID], {
      queryParams: { type: 'general' },
    });
  }
  openExpenseDialog(type: 'general' | 'material') {
    const dialogRef = this.dialog.open(ExpenseDialogComponent, {
      width: '400px',
      data: { type }, // Pass type to dialog
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Dialog closed successfully, refreshing data...');
        this.getGeneralExpense(this.type, this.params); // Refresh your list
      }
    });
  }
}
