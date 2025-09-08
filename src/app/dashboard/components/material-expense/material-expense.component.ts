import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ExpenseDialogComponent } from 'src/app/shared/components/expense-dialog/expense-dialog.component';

@Component({
  selector: 'app-material-expense',
  templateUrl: './material-expense.component.html',
  styleUrls: ['./material-expense.component.scss'],
})
export class MaterialExpenseComponent implements OnInit {
  userInfo = JSON.parse(localStorage.getItem('user') || '{}');

  selectedDateRange = { start: null as Date | null, end: null as Date | null };
  type = 'material_expense';
  selectedBranchIds: any[] = [];
  searchQuery = '';

  params: any = {
    searchQuery: '',
    branchIds: [],
    startDate: null,
    endDate: null,
    page: 1,
  };

  displayedColumns = [
    this.translate.instant('MATERIAL'),
    this.translate.instant('TOTAL_PRICE'),
    this.translate.instant('QUANTITY'),
    this.translate.instant('BRANCH'),
    this.translate.instant('MEASURE_UNIT'),
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
    this.getMaterialExpense(this.type, this.params);
  }

  getMaterialExpense(type: string = 'material_expense', params: any) {
    this.dashboardService.getExpenses(type, params).subscribe({
      next: (res: any) => {
        // Expecting API to return: { results: [...], count: number }
        this.expenseRes = res.results.map((item: any) => ({
          MATERIAL: item.material,
          TOTAL_PRICE: item.total_price,
          QUANTITY: item.quantity,
          BRANCH: item.branch,
          MEASURE_UNIT: item.measure_unit,
          ID: item.id,
          BRANCH_ID: item.branch_id,
          MATERIAL_ID: item.material_id,
        }));
        this.totalItems = res.count;
        this.currentPage = params.page;
      },
    });
  }

  pageChanged(page: number) {
    this.params.page = page;
    this.getMaterialExpense(this.type, this.params);
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
      this.getMaterialExpense(this.type, this.params);
    }
  }

  searchExpense(searchQuery: string) {
    this.params.searchQuery = searchQuery;
    this.params.page = 1;
    this.getMaterialExpense(this.type, this.params);
  }

  onBranchSelectionChange(selected: any) {
    this.selectedBranchIds = selected;
    this.params.branchIds = selected;
    this.params.page = 1;
    this.getMaterialExpense(this.type, this.params);
  }

  formatDateForAPI(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  goToExpenseProfile(expense: any) {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/dashboard/expense', expense.ID], {
        queryParams: { type: 'material' },
      })
    );
    window.open(url, '_blank');
  }

  openExpenseDialog(type: 'general' | 'material') {
    const dialogRef = this.dialog.open(ExpenseDialogComponent, {
      width: '500px',
      data: { type },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getMaterialExpense(this.type, this.params);
      }
    });
  }

  editExpense(expense: any) {
    const body = {
      material: expense.MATERIAL,
      total_price: expense.TOTAL_PRICE,
      quantity: expense.QUANTITY,
    };
    const dialogRef = this.dialog.open(ExpenseDialogComponent, {
      width: '500px',
      data: {
        type: 'material',
        isEdit: true,
        expense: body,
        id: expense.ID,
        materialId: expense.MATERIAL_ID,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getMaterialExpense(this.type, this.params);
      }
    });
  }
}
