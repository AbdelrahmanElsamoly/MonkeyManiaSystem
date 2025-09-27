import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DashboardService } from 'src/app/dashboard/dashboard.service';
import { Location } from '@angular/common';

interface ProductBillProduct {
  unit_price: string;
  total_price: number;
  quantity: number;
  notes: string;
  name: string;
}

interface ProductBillData {
  id: number;
  bill_number: number;
  table_number: number;
  total_price: string;
  take_away: boolean;
  bill: number;
  products: ProductBillProduct[];
  returned_products: any[];
  created_by: number;
  created: string;
  updated: string;
}

interface BillChild {
  id: number;
  name: string;
  phone_numbers: Array<{
    phone_number: string;
    relationship: string;
  }>;
}

interface BillData {
  id: number;
  first_child: BillChild[];
  branch: string;
  created: string;
}

@Component({
  selector: 'app-cofe-bill',
  templateUrl: './cofe-bill-dialog.component.html',
  styleUrls: ['./cofe-bill-dialog.component.scss'],
})
export class CofeBillDialogComponent implements OnInit {
  productBillData: ProductBillData | null = null;
  billData: BillData | null = null;
  loading: boolean = true;
  productBillId: number = 0;
  userInfo = JSON.parse(localStorage.getItem('user') || '{}');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dashboardService: DashboardService,
    private toaster: ToastrService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.productBillId = +params['id'];
      if (this.productBillId) {
        this.loadProductBillData();
      }
    });
  }

  loadProductBillData(): void {
    this.loading = true;
    this.dashboardService.getBillDetails(this.productBillId).subscribe(
      (response: any) => {
        this.productBillData = response;
        this.billData = response;
        this.loading = false;
      },
      (error: any) => {
        console.error('Error loading product bill:', error);
        this.toaster.error('Failed to load bill details');
        this.loading = false;
      }
    );
  }

  printBill(): void {
    window.print();
  }

  goBack(): void {
    this.location.back();
  }

  getChildrenNames(): string {
    if (!this.billData?.first_child?.length) {
      return 'N/A';
    }
    return this.billData.first_child.map((child) => child.name).join(', ');
  }
}
