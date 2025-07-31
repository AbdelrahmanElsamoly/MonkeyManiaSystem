import { Component } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-child-profile',
  templateUrl: './child-profile.component.html',
  styleUrls: ['./child-profile.component.scss'],
})
export class ChildProfileComponent {
  profileId = '';
  childData: any;
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
    this.dashboardService.getChildById(this.profileId).subscribe({
      next: (data) => {
        this.isloading = false;
        this.childData = data;
      },
      error: (error) => {
        console.error('Error fetching profile:', error);
      },
    });
  }
}
