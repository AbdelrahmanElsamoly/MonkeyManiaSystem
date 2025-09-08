import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { TranslateService } from '@ngx-translate/core';
import { SchoolDialogComponent } from 'src/app/shared/components/school-dialog/school-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-schools',
  templateUrl: './schools.component.html',
  styleUrls: ['./schools.component.scss'],
})
export class SchoolsComponent implements OnInit {
  displayedColumns = [
    this.translate.instant('NAME'),
    this.translate.instant('ADDRESS'),
    this.translate.instant('CREATED_BY'),
  ];
  searchTerm: string = '';
  myTableData = [];
  isloadign: boolean = false;

  constructor(
    private dashboardService: DashboardService,
    private translate: TranslateService,
    private dialog: MatDialog,
    private router: Router,
    private toaster: ToastrService
  ) {}
  ngOnInit(): void {
    this.getschools();
  }
  getschools(searchQuery: string = '') {
    this.isloadign = true;
    this.dashboardService.getSchools(searchQuery).subscribe({
      next: (data: any) => {
        this.isloadign = false;
        this.myTableData = data.map((school: any) => ({
          NAME: school.name,
          ADDRESS: school.address,
          CREATED_BY: school.created_by,
          NOTES: school.notes,
          ID: school.id,
        }));
      },
      error: (error) => {
        console.error('Error fetching schools:', error);
      },
    });
  }
  searchSchools(query: string) {
    this.getschools(query);
  }

  openSchoolDialog() {
    const dialogRef = this.dialog.open(SchoolDialogComponent, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getschools();
      }
    });
  }

  editSchool(row: any) {
    const dialogRef = this.dialog.open(SchoolDialogComponent, {
      width: '500px',
      data: {
        name: row.NAME,
        address: row.ADDRESS,
        notes: row.NOTES,
        id: row.ID,
        event: 'edit',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getschools();
      }
    });
  }
  goToSchoolProfilePage(schoolId: any) {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/dashboard/school', schoolId])
    );
    window.open(url, '_blank');
  }
  schoolBulkUpLoad(csvFile: any) {
    this.dashboardService.uploadBulkSchool(csvFile).subscribe((res: any) => {
      this.toaster.success(res.message);
    });
  }
}
