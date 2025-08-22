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
  userInfo = JSON.parse(localStorage.getItem('user') || '{}');

  selectedDateRange = { start: null as Date | null, end: null as Date | null };
  type = 'general_expense';
  selectedBranchIds: any[] = [];
  searchQuery = '';

  params: any = {
    searchQuery: '',
    branchIds: [],
    startDate: null,
    endDate: null,
    page: 1,
    pageSize: 10, // fixed 10 per page
  };

  displayedColumns = [
    this.translate.instant('NAME'),
    this.translate.instant('TOTAL_PRICE'),
    this.translate.instant('QUANTITY'),
    this.translate.instant('BRANCH'),
  ];

  expenseRes: any[] = [];
  totalItems = 0;
  currentPage = 1;

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
      next: (res: any) => {
        // Expecting API to return: { data: [...], total: number }
        this.expenseRes = res.results.map((item: any) => ({
          Name: item.name,
          TOTAL_PRICE: item.total_price,
          QUANTITY: item.quantity,
          BRANCH: item.branch,
          ID: item.id,
          BRANCH_ID: item.branch_id,
        }));
        this.totalItems = res.count;
        this.currentPage = params.page;
      },
    });
  }

  pageChanged(page: number) {
    this.params.page = page;
    this.getGeneralExpense(this.type, this.params);
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
      this.params.startDate = this.formatDateForAPI(start);
      this.params.endDate = this.formatDateForAPI(end);
      this.params.page = 1;
      this.getGeneralExpense(this.type, this.params);
    }
  }

  searchExpense(searchQuery: string) {
    this.params.searchQuery = searchQuery;
    this.params.page = 1;
    this.getGeneralExpense(this.type, this.params);
  }

  onBranchSelectionChange(selected: any) {
    this.selectedBranchIds = selected;
    this.params.branchIds = selected;
    this.params.page = 1;
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
      width: '500px',
      data: { type },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getGeneralExpense(this.type, this.params);
      }
    });
  }

  editExpense(expense: any) {
    const body = {
      name: expense.Name,
      branch: expense.BRANCH,
      total_price: expense.TOTAL_PRICE,
      quantity: expense.QUANTITY,
    };
    const dialogRef = this.dialog.open(ExpenseDialogComponent, {
      width: '500px',
      data: {
        type: 'general',
        branchId: expense.BRANCH_ID,
        isEdit: true,
        expense: body,
        id: expense.ID,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getGeneralExpense(this.type, this.params);
      }
    });
  }
}
