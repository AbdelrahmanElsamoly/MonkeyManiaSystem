import { Component, OnInit, AfterViewInit } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { TranslateService } from '@ngx-translate/core';
declare var $: any; // Declare jQuery

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent implements OnInit {
  customOptions: OwlOptions = {
    loop: true,
    margin: 20,
    nav: true,
    navText: [
      '<span class="owl-nav-prev">&#10094;</span>',
      '<span class="owl-nav-next">&#10095;</span>',
    ],
    // autoplay: true, // ✅ enable autoplay
    // autoplayTimeout: 1000, // ⏱ time between slides (in ms)
    // autoplayHoverPause: true, // 🛑 pause on hover
    rtl: true,
    dots: false,
    // smartSpeed: 1000,

    responsive: {
      0: { items: 1 },
      576: { items: 2 },
      768: { items: 3 },
      992: { items: 4 },
      1200: { items: 4 },
    },
  };

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
            color: '#28a745',
          },
          {
            title: 'TODAYS_CHILDREN_COUNT',
            value: res.children_today ?? 0,
            subtext: `${this.translate.instant('CHILDREN_COUNT_DIFF')} : ${
              res.children_diff ?? 0
            }`,
            icon: '👶',
            color: '#dc3545',
          },
          {
            title: 'TODAYS_CAFE_SALES',
            value: `US$ ${(res.cafe_sales ?? 0).toFixed(2)}`,
            subtext: `${this.translate.instant('CAFE_SALES_DIFF')} : ${
              res.cafe_diff ?? 0
            }`,
            icon: '☕',
            color: '#ffc107',
          },
          {
            title: 'TODAYS_KIDS_SALES',
            value: `US$ ${(res.kids_sales ?? 0).toFixed(2)}`,
            subtext: `${this.translate.instant('KIDS_SALES_DIFF')} : ${
              res.kids_diff ?? 0
            }`,
            icon: '🧒',
            color: '#17a2b8',
          },
          {
            title: 'TODAYS_MONEY_UNBALANCE',
            value: `US$ ${(res.money_unbalance ?? 0).toFixed(2)}`,
            subtext: `قيمة غير متوازنة`,
            icon: '📉',
            color: '#343a40',
          },
          {
            title: 'TODAYS_STAFF_WITHDRAWS_TOTAL',
            value: `US$ ${(res.staff_withdraw_total ?? 0).toFixed(2)}`,
            subtext: `${this.translate.instant(
              'TODAYS_STAFF_REQUESTED_WITHDRAW_COUNT'
            )} : ${res.staff_withdraw_count ?? 0}`,
            icon: '💵',
            color: '#007bff',
          },
        ];
      });
  }
}
