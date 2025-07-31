import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DashboardService } from '../../dashboard.service';

@Component({
  selector: 'app-expense',
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.scss'],
})
export class ExpenseComponent {
  type!: string; // 'material' or 'general'
  expense: any = null;

  constructor(
    private route: ActivatedRoute,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.type = this.route.snapshot.queryParamMap.get('type') || 'material'; // default material

    if (this.type === 'material') {
      this.dashboardService.getMaterialExpenseById(id).subscribe({
        next: (data) => (this.expense = data),
        error: (err) => console.error('Error fetching material expense:', err),
      });
    } else {
      this.dashboardService.getGeneralExpenseById(id).subscribe({
        next: (data) => (this.expense = data),
        error: (err) => console.error('Error fetching general expense:', err),
      });
    }
  }
}
