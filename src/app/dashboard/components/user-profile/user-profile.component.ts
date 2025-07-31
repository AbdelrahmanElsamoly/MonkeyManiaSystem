import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DashboardService } from '../../dashboard.service'; // Replace with your actual service

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit {
  userId!: number;
  userData: any;

  constructor(
    private route: ActivatedRoute,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.userId = +id;
        this.getUserById(this.userId);
      }
    });
  }

  getUserById(id: number) {
    this.dashboardService.getUserById(id).subscribe({
      next: (data) => {
        this.userData = data;
      },
      error: (err) => {
        console.error('Failed to fetch user:', err);
      },
    });
  }
}
