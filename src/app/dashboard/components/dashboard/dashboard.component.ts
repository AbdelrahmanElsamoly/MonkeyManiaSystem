import { Component, OnInit, OnDestroy } from '@angular/core';
import { loginService } from 'src/app/auth/login.service';
import { MatDialog } from '@angular/material/dialog';
import { BranchesDialogComponent } from 'src/app/shared/components/branches-dialog/branches-dialog.component';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  sidebarCollapsed = true;
  userInfo = JSON.parse(localStorage.getItem('user') || '{}');
  branch: any = JSON.parse(localStorage.getItem('branch') || 'null') ||
    (this.userInfo?.branch_id ? { id: this.userInfo.branch_id, name: this.userInfo.branch } : {});
  currentDate = new Date();
  intervalId: any;
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

  isMobile = false; // ✅ detect mobile
  showMobileMenu = false; // ✅ toggle mobile nav
  private emojiIndex = 0;

  private breakpointSub!: Subscription;

  constructor(
    private authService: loginService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.intervalId = setInterval(() => {
      this.currentDate = new Date();
    }, 60000);

    setInterval(() => {
      this.emojiIndex = (this.emojiIndex + 1) % this.clockEmojis.length;
      this.clockEmoji = this.clockEmojis[this.emojiIndex];
    }, 1000);

  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }

  logOUt() {
    this.authService.logout();
  }
  makeOrder() {
    this.router.navigate(['/dashboard/order']);
  }
  openBranchDialog() {
    const dialogRef = this.dialog.open(BranchesDialogComponent, {
      width: '500px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(() => {
      this.branch = JSON.parse(localStorage.getItem('branch') || 'null') || {};
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
    if (this.breakpointSub) this.breakpointSub.unsubscribe();
  }
}
