import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-child-bill',
  templateUrl: './child-bill.component.html',
  styleUrls: ['./child-bill.component.scss'],
})
export class ChildBillComponent implements OnInit {
  bill: any;
  constructor(
    private dashboardService: DashboardService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.getBillById(id);
  }
  getBillById(id: any) {
    this.dashboardService.getChildBillById(id).subscribe((res: any) => {
      this.bill = res;
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
}
