import { formatDate } from '@angular/common';
import { Component } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-child-profile',
  templateUrl: './child-profile.component.html',
  styleUrls: ['./child-profile.component.scss'],
})
export class ChildProfileComponent {
  profileId = '';
  childData: any;
  visitRows: any[] = [];
  isloading: boolean = false;
  readonly allChildBillsLabel = '\u0639\u0631\u0636 \u0643\u0644 \u0641\u0648\u0627\u062A\u064A\u0631 \u0627\u0644\u0637\u0641\u0644';
  readonly visitHistoryTitle = '\u0647\u0633\u062A\u0648\u0631\u064A \u0632\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u0637\u0641\u0644';
  readonly noVisitsText = '\u0644\u0627 \u062A\u0648\u062C\u062F \u0632\u064A\u0627\u0631\u0627\u062A \u0644\u0647\u0630\u0627 \u0627\u0644\u0637\u0641\u0644';
  readonly visitColumns = [
    'serial',
    'branch_name',
    'children_count',
    'spent_time (\u0639\u062F\u062F \u0627\u0644\u0633\u0627\u0639\u0627\u062A)',
    'created (\u0648\u0642\u062A \u0627\u0644\u062F\u062E\u0648\u0644)',
    'finished (\u0648\u0642\u062A \u0627\u0644\u062E\u0631\u0648\u062C)',
  ];

  constructor(
    private dashboardService: DashboardService,
    private route: ActivatedRoute,
    private router: Router
  ) {}
  ngOnInit() {
    this.profileId = this.route.snapshot.paramMap.get('id')!;
    this.getProfileData();
  }

  getProfileData() {
    this.isloading = true;
    this.dashboardService.getChildById(this.profileId).subscribe({
      next: (data: any) => {
        this.isloading = false;
        this.childData = data;
        this.visitRows = (data?.bills || []).map((bill: any) => ({
          serial: bill.serial || bill.id,
          branch_name: bill.branch_name || '-',
          children_count: bill.children_count,
          'spent_time (\u0639\u062F\u062F \u0627\u0644\u0633\u0627\u0639\u0627\u062A)': this.getSpentHours(bill.spent_time),
          'created (\u0648\u0642\u062A \u0627\u0644\u062F\u062E\u0648\u0644)': this.formatVisitDate(bill.created),
          'finished (\u0648\u0642\u062A \u0627\u0644\u062E\u0631\u0648\u062C)': bill.finished ? this.formatVisitDate(bill.finished) : '-',
          BILLS_ID: bill.id,
        }));
      },
      error: (error) => {
        console.error('Error fetching profile:', error);
        this.isloading = false;
      },
    });
  }

  goToBillDetails(bill: any): void {
    this.router.navigate(['/dashboard/bills/child', bill.BILLS_ID || bill.serial]);
  }

  goToAllChildBills(): void {
    this.router.navigate(['/dashboard/bills/children/all'], {
      queryParams: { child_id: this.profileId },
    });
  }

  getSpentHours(spentTime: number | null | undefined): string {
    const minutes = Number(spentTime || 0);
    const hours = minutes / 60;
    return Number.isInteger(hours) ? String(hours) : hours.toFixed(2);
  }

  private formatVisitDate(value: string): string {
    return formatDate(value, 'medium', 'ar-EG');
  }
}