// main-page.component.ts
import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent implements OnInit {
  userInfo = JSON.parse(localStorage.getItem('user') || '{}');
  mainPageData: any = {};
  data: any;

  constructor(
    private dashboardService: DashboardService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.getStatstics();
  }

  getStatstics() {
    this.dashboardService
      .getStatistics(this.userInfo.branch)
      .subscribe((res: any) => {
        this.data = [
          {
            title: 'TODAYS_SUBSCRIPTIONS_SALES',
            value: `US$ ${(res.subscriptions_sales ?? 0).toFixed(2)}`,
            subtext: `${this.translate.instant(
              'TODAYS_SUBSCRIPTIONS_COUNT'
            )} : ${res.subscriptions_count ?? 0}`,
            icon: '💳',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple gradient
          },
          {
            title: 'TODAYS_CHILDREN_COUNT',
            value: res.children_today ?? 0,
            subtext: `${this.translate.instant('CHILDREN_COUNT_DIFF')} : ${
              res.children_diff ?? 0
            }`,
            icon: '👶',
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Pink to coral gradient
          },
          {
            title: 'TODAYS_CAFE_SALES',
            value: `US$ ${(res.cafe_sales ?? 0).toFixed(2)}`,
            subtext: `${this.translate.instant('CAFE_SALES_DIFF')} : ${
              res.cafe_diff ?? 0
            }`,
            icon: '☕',
            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Blue to cyan gradient
          },
          {
            title: 'TODAYS_KIDS_SALES',
            value: `US$ ${(res.kids_sales ?? 0).toFixed(2)}`,
            subtext: `${this.translate.instant('KIDS_SALES_DIFF')} : ${
              res.kids_diff ?? 0
            }`,
            icon: '🧒',
            gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Green to teal gradient
          },
          {
            title: 'TODAYS_MONEY_UNBALANCE',
            value: `US$ ${(res.money_unbalance ?? 0).toFixed(2)}`,
            subtext: `قيمة غير متوازنة`,
            icon: '📉',
            gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // Pink to yellow gradient
          },
          {
            title: 'TODAYS_STAFF_WITHDRAWS_TOTAL',
            value: `US$ ${(res.staff_withdraw_total ?? 0).toFixed(2)}`,
            subtext: `${this.translate.instant(
              'TODAYS_STAFF_REQUESTED_WITHDRAW_COUNT'
            )} : ${res.staff_withdraw_count ?? 0}`,
            icon: '💵',
            gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // Mint to pink gradient
          },
        ];
      });
  }
}
