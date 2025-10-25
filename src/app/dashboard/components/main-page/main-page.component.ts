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
    // Auto select today only
    // const today = new Date();

    // this.selectedDateRange.start = today;
    // this.selectedDateRange.end = today;

    this.getStatstics();
  }

  getStatstics() {
    const branchId = this.userInfo.branch
      ? this.userInfo.branch
      : this.branch.id;

    // Only send params if dates are selected
    let paramsObj: any = {};

    if (this.selectedDateRange.start && this.selectedDateRange.end) {
      paramsObj = {
        startDate: this.formatDateForAPI(this.selectedDateRange.start),
        endDate: this.formatDateForAPI(this.selectedDateRange.end),
      };
    }

    this.dashboardService
      .getStatistics(branchId, paramsObj)
      .subscribe((res: any) => {
        this.data = [
          {
            title: 'TODAYS_SUBSCRIPTIONS_SALES',
            value: `US$ ${this.extractValue(res.todays_subscriptions_sales)}`,
            subtext: `${this.translate.instant(
              'TODAYS_SUBSCRIPTIONS_COUNT'
            )} : ${this.extractCount(res.todays_subscriptions_sales)}`,
            icon: '🎫',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          },
          {
            title: 'TODAYS_CHILDREN_COUNT',
            value: res.todays_children_count ?? 0,
            subtext: res.children_count_difference_from_yesterday ?? '',
            icon: '👶',
            gradient: 'linear-gradient(135deg, #f093fb 0%, #d42d44ff 100%)',
          },
          {
            title: 'TODAYS_CAFE_SALES',
            value: `US$ ${this.extractValue(res.todays_cafe_sales)}`,
            subtext: res.cafe_sales_difference_from_yesterday ?? '',
            icon: '☕',
            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          },
          {
            title: 'TODAYS_KIDS_SALES',
            value: `US$ ${this.extractValue(res.todays_kids_sales)}`,
            subtext: res.kids_sales_difference_from_yesterday ?? '',
            icon: '🧒',
            gradient: 'linear-gradient(135deg, #124924ff 0%, #38f9d7 100%)',
          },
          {
            title: 'TODAYS_MONEY_UNBALANCE',
            value: `US$ ${this.extractValue(res.todays_money_unbalance)}`,
            subtext:
              res.money_unbalance_difference_from_yesterday ??
              'قيمة غير متوازنة',
            icon: '📉',
            gradient: 'linear-gradient(135deg, #fa709a 0%, #eed12fff 100%)',
          },
          {
            title: 'TODAYS_STAFF_WITHDRAWS_TOTAL',
            value: `US$ ${this.extractValue(res.todays_staff_withdraws_total)}`,
            subtext: res.todays_staff_requested_withdraw_count ?? '',
            icon: '💼',
            gradient: 'linear-gradient(135deg, #435ed4ff 0%, #7f2ecfff 100%)',
          },
          {
            title: 'TODAYS_CASH',
            value: `US$ ${this.extractValue(res.todays_cash)}`,
            subtext:
              res.cash_difference_from_yesterday ??
              this.translate.instant('CASH_PAYMENTS'),
            icon: '💵',
            gradient: 'linear-gradient(135deg, #a8edea 0%, #2c29c4ff 100%)',
          },
          {
            title: 'TODAYS_VISA',
            value: `US$ ${this.extractValue(res.todays_visa)}`,
            subtext:
              res.visa_difference_from_yesterday ??
              this.translate.instant('VISA_PAYMENTS'),
            icon: '💳',
            gradient: 'linear-gradient(135deg, #ffecd2 0%, #ee6436ff 100%)',
          },
          {
            title: 'TODAYS_INSTAPAY',
            value: `US$ ${this.extractValue(res.todays_instapay)}`,
            subtext:
              res.instapay_difference_from_yesterday ??
              this.translate.instant('INSTAPAY_PAYMENTS'),
            icon: '📱',
            gradient: 'linear-gradient(135deg, #89f7fe 0%, #2369ccff 100%)',
          },
        ];
      });
  }

  // Helper method to extract numeric value from format "680.00 (3)" or just "0"
  extractValue(value: any): string {
    if (!value) return '0.00';
    const strValue = value.toString();
    const match = strValue.match(/^([+-]?\d+\.?\d*)/);
    return match ? parseFloat(match[1]).toFixed(2) : '0.00';
  }

  // Helper method to extract count from format "680.00 (3)"
  extractCount(value: any): number {
    if (!value) return 0;
    const strValue = value.toString();
    const match = strValue.match(/\((\d+)\)/);
    return match ? parseInt(match[1]) : 0;
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
