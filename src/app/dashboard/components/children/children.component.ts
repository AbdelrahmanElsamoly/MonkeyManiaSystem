import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { ChildDialogComponent } from 'src/app/shared/components/child-dialog/child-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-children',
  templateUrl: './children.component.html',
  styleUrls: ['./children.component.scss'],
})
export class ChildrenComponent implements OnInit {
  displayedColumns = [
    this.translate.instant('NAME'),
    this.translate.instant('AGE'),
    this.translate.instant('PHONE_NUMBER'),
    this.translate.instant('STATUS'),
  ];
  totalChildren: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  searchTerm: string = '';
  myTableData = [];
  isloadign: boolean = false;

  constructor(
    private dashboardService: DashboardService,
    private translate: TranslateService,
    private router: Router,
    private dialog: MatDialog
  ) {}
  ngOnInit(): void {
    this.getChildrenData();
  }
  getChildrenData(searchQuery: string = '', page: number = 1) {
    this.isloadign = true;
    this.dashboardService.getChild(searchQuery, page).subscribe({
      next: (res: any) => {
        this.isloadign = false;

        this.myTableData = res.results.map((child: any) => ({
          CHILD_NAME: child.name,
          AGE: `${child.age.years}Y ${child.age.months}M ${child.age.days}D`,
          PHONE_NUMBER: child.child_phone_numbers_set[0]?.phone_number || 'N/A',
          STATUS: child.is_active ? '✅' : '❌',
          ID: child.id,
          CHILD: child,
        }));

        this.totalChildren = res.count; // ✅ needed for DataTable totalItems
        this.currentPage = page; // ✅ keep current page in sync
      },
      error: (error) => {
        console.error('Error fetching children:', error);
        this.isloadign = false;
      },
    });
  }

  goToChildProfilePge(childId: any) {
    this.router.navigate(['/dashboard/child', childId]);
  }
  openCreateChildDialog() {
    const dialogRef = this.dialog.open(ChildDialogComponent, {
      width: '600px', // adjust size if needed
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getChildrenData();
      }
    });
  }
  editChild(data: any) {
    const dialogRef = this.dialog.open(ChildDialogComponent, {
      width: '600px', // adjust size if needed
      data: {
        childData: data.CHILD,
      }, // optional data you want to pass
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getChildrenData();
      }
    });
  }
}
