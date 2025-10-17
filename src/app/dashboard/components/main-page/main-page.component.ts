// main-page.component.ts
import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent implements OnInit {
  userInfo = JSON.parse(localStorage.getItem('user') || '{}');
  branch = JSON.parse(localStorage.getItem('branch') || '{}');
  mainPageData: any = {};
  data: any;

  // Add date range selection
  selectedDateRange: { start: Date | null; end: Date | null } = {
    start: null,
    end: null,
  };

  constructor(
    private dashboardService: DashboardService,
    private translate: TranslateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Auto select last two days (optional)
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    this.selectedDateRange.start = yesterday;
    this.selectedDateRange.end = today;

    this.getStatstics();
  }

  getStatstics() {
    const branchId = this.userInfo.branch
      ? this.userInfo.branch
      : this.branch.id;

    // Prepare params object with dates
    const paramsObj = {
      startDate: this.selectedDateRange.start
        ? this.formatDateForAPI(this.selectedDateRange.start)
        : undefined,
      endDate: this.selectedDateRange.end
        ? this.formatDateForAPI(this.selectedDateRange.end)
        : undefined,
    };

    this.dashboardService
      .getStatistics(branchId, paramsObj)
      .subscribe((res: any) => {
        this.data = [
          {
            title: 'TODAYS_SUBSCRIPTIONS_SALES',
            value: `US$ ${(res.todays_subscriptions_sales ?? 0).toFixed(2)}`,
            subtext: `${this.translate.instant(
              'TODAYS_SUBSCRIPTIONS_COUNT'
            )} : ${res.todays_subscriptions_count ?? 0}`,
            icon: '🎫',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          },
          {
            title: 'TODAYS_CHILDREN_COUNT',
            value: res.todays_children_count ?? 0,
            subtext: `${this.translate.instant('CHILDREN_COUNT_DIFF')} : ${
              res.children_count_difference_from_yesterday
            }`,
            icon: '👶',
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          },
          {
            title: 'TODAYS_CAFE_SALES',
            value: `US$ ${(res.todays_cafe_sales ?? 0).toFixed(2)}`,
            subtext: `${this.translate.instant('CAFE_SALES_DIFF')} : ${
              res.cafe_sales_difference_from_yesterday ?? 0
            }`,
            icon: '☕',
            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          },
          {
            title: 'TODAYS_KIDS_SALES',
            value: `US$ ${(res.todays_kids_sales ?? 0).toFixed(2)}`,
            subtext: `${this.translate.instant('KIDS_SALES_DIFF')} : ${
              res.kids_sales_difference_from_yesterday ?? 0
            }`,
            icon: '🧒',
            gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          },
          {
            title: 'TODAYS_MONEY_UNBALANCE',
            value: `US$ ${res.todays_money_unbalance}`,
            subtext: `قيمة غير متوازنة`,
            icon: '📉',
            gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          },
          {
            title: 'TODAYS_STAFF_WITHDRAWS_TOTAL',
            value: `US$ ${(res.todays_staff_withdraws_total ?? 0).toFixed(2)}`,
            subtext: `${this.translate.instant(
              'TODAYS_STAFF_REQUESTED_WITHDRAW_COUNT'
            )} : ${res.todays_staff_requested_withdraw_count ?? 0}`,
            icon: '💼',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          },
          {
            title: 'TODAYS_CASH',
            value: `US$ ${(res.todays_cash ?? 0).toFixed(2)}`,
            subtext: `${this.translate.instant('CASH_PAYMENTS')}`,
            icon: '💵',
            gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
          },
          {
            title: 'TODAYS_VISA',
            value: `US$ ${(res.todays_visa ?? 0).toFixed(2)}`,
            subtext: `${this.translate.instant('VISA_PAYMENTS')}`,
            icon: '💳',
            gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
          },
          {
            title: 'TODAYS_INSTAPAY',
            value: `US$ ${(res.todays_instapay ?? 0).toFixed(2)}`,
            subtext: `${this.translate.instant('INSTAPAY_PAYMENTS')}`,
            icon: '📱',
            gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
          },
        ];
      });
  }

  // Add date change handlers
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
      this.getStatstics();
    }
  }

  formatDateForAPI(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
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
}
