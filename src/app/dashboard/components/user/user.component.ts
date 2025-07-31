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
  constructor(
    private dashboardService: DashboardService,
    private translate: TranslateService,
    private router: Router
  ) {}
  ngOnInit() {
    if (this.tableData) {
      this.getUsers();
    }
  }

  getUsers(searchQuery: string = '', branchIds: number[] = []) {
    this.isLoading = true;
    this.dashboardService.getUsers(searchQuery, branchIds).subscribe({
      next: (data: any) => {
        this.isLoading = false;
        this.tableData = data.map((user: any) => ({
          NAME: user.username,
          PHONE_NUMBERS: user.phone_number,
          BRANCH: user.branch,
          STATUS: user.is_active ? '✅' : '❌',
          ROLE: user.role,
          ID: user.id,
        }));
      },
      error: (error) => {
        console.error('Error fetching schools:', error);
      },
    });
  }
  searchUsers(searchQuery: string) {
    console.log(this.selectedBranch);
    this.getUsers(searchQuery, this.selectedBranch);
  }
  onBranchSelectionChange(searchQuery: string, selected: number[]) {
    this.selectedBranch = selected;
    this.getUsers(searchQuery, selected);
  }
  goToProfilePage(userId: any) {
    this.router.navigate(['/dashboard/user', userId]);
  }
}
