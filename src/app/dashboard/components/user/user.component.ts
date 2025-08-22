import { Component } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
})
export class UserComponent {
  userInfo = JSON.parse(localStorage.getItem('user') || '{}');

  displayedColumns = [
    this.translate.instant('NAME'),
    this.translate.instant('PHONE_NUMBERS'),
    this.translate.instant('BRANCH'),
    this.translate.instant('STATUS'),
    this.translate.instant('ROLE'),
  ];
  searchTerm: string = '';
  tableData: any[] = [];
  isLoading: boolean = false;
  selectedBranch: any;

  // ✅ Added for server pagination
  totalUsers: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;

  constructor(
    private dashboardService: DashboardService,
    private translate: TranslateService,
    private router: Router
  ) {}

  ngOnInit() {
    this.getUsers();
  }

  // ✅ Updated to request paginated data from API
  getUsers(
    searchQuery: string = '',
    branchIds: number[] = [],
    page: number = 1
  ) {
    this.isLoading = true;
    this.dashboardService.getUsers(searchQuery, branchIds, page).subscribe({
      next: (res: any) => {
        this.isLoading = false;

        this.tableData = res.results.map((user: any) => ({
          NAME: user.username,
          PHONE_NUMBERS: user.phone_number,
          BRANCH: user.branch,
          STATUS: user.is_active ? '✅' : '❌',
          ROLE: user.role,
          ID: user.id,
        }));

        this.totalUsers = res.count;
        this.currentPage = page;
      },
      error: (error) => {
        console.error('Error fetching users:', error);
        this.isLoading = false;
      },
    });
  }

  searchUsers(searchQuery: string) {
    this.getUsers(searchQuery, this.selectedBranch, 1);
  }

  onBranchSelectionChange(searchQuery: string, selected: number[]) {
    this.selectedBranch = selected;
    this.getUsers(searchQuery, selected, 1);
  }

  goToProfilePage(userId: any) {
    this.router.navigate(['/dashboard/user', userId]);
  }

  // ✅ Called when DataTable emits a page change
  onPageChange(page: number) {
    this.getUsers(this.searchTerm, this.selectedBranch, page);
  }
}
