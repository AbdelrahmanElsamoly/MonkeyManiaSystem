import { Component, OnInit, OnDestroy } from '@angular/core';
import { loginService } from 'src/app/auth/login.service';
import { MatDialog } from '@angular/material/dialog';
import { BranchesDialogComponent } from 'src/app/shared/components/branches-dialog/branches-dialog.component';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  sidebarCollapsed = true;
  userInfo = JSON.parse(localStorage.getItem('user') || '{}');
  branch = JSON.parse(localStorage.getItem('branch') || '{}');
  currentDate = new Date();
  intervalId: any;

  // ✅ New for mobile view
  isMobile = false;
  showMobileMenu = false;
  private bpSub!: Subscription;

  clockEmoji = '🕒';
  private clockEmojis = [
    '🕐',
    '🕑',
    '🕒',
    '🕓',
    '🕔',
    '🕕',
    '🕖',
    '🕗',
    '🕘',
    '🕙',
    '🕚',
    '🕛',
  ];
  private emojiIndex = 0;
  constructor(
    private authService: loginService,
    private dialog: MatDialog,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {
    this.intervalId = setInterval(() => {
      this.currentDate = new Date();
    }, 60000);
    setInterval(() => {
      this.emojiIndex = (this.emojiIndex + 1) % this.clockEmojis.length;
      this.clockEmoji = this.clockEmojis[this.emojiIndex];
    }, 1000);
    // ✅ Detect mobile
    this.bpSub = this.breakpointObserver
      .observe(['(max-width: 992px)'])
      .subscribe((result) => {
        this.isMobile = result.matches;
        if (!this.isMobile) this.showMobileMenu = false;
      });
    console.log(this.branch);
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  logOUt() {
    this.authService.logout();
  }

  openBranchDialog() {
    const dialogRef = this.dialog.open(BranchesDialogComponent, {
      width: '500px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(() => {
      this.branch = JSON.parse(localStorage.getItem('branch') || '{}');
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
    if (this.bpSub) this.bpSub.unsubscribe();
  }
}
