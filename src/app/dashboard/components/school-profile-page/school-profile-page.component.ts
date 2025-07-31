import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-school-profile-page',
  templateUrl: './school-profile-page.component.html',
  styleUrls: ['./school-profile-page.component.scss'],
})
export class SchoolProfilePageComponent implements OnInit {
  profileId = '';
  schoolDate: any;
  isloading: boolean = false;

  constructor(
    private dashboardService: DashboardService,
    private route: ActivatedRoute
  ) {}
  ngOnInit() {
    this.profileId = this.route.snapshot.paramMap.get('id')!;
    this.getProfileData();
  }

  getProfileData() {
    this.isloading = true;
    this.dashboardService.getSchoolById(this.profileId).subscribe({
      next: (data) => {
        this.isloading = false;
        this.schoolDate = data;
      },
      error: (error) => {
        console.error('Error fetching profile:', error);
      },
    });
  }
}
