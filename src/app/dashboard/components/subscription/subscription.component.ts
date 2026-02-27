import { Component, OnInit, OnDestroy } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SubscriptionDialogComponent } from 'src/app/shared/components/subscription-dialog/subscription-dialog.component';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss'],
})
export class SubscriptionComponent implements OnInit, OnDestroy {
  private searchSubject = new Subject<string>();
  isLoading = false;
  searchQuery = '';
  subscriptions: any[] = [];
  filteredSubscriptions: any[] = [];

  constructor(
    private dashboardService: DashboardService,
    private translate: TranslateService,
    private dialog: MatDialog,
    private toaster: ToastrService
  ) {}

  ngOnInit(): void {
    this.getAllSubscriptions();
    this.searchSubject.pipe(debounceTime(400), distinctUntilChanged()).subscribe((query) => {
      this.applySearch(query);
    });
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  getAllSubscriptions() {
    this.isLoading = true;
    this.dashboardService.getAllSubscriptions().subscribe({
      next: (res: any) => {
        this.subscriptions = res.map((item: any) => ({
          SUBSCRIPTION_NAME: item.name,
          HOURS: item.hours,
          INSTANCE_DURATION: `${item.instance_duration} ${this.translate.instant('DAY')}`,
          PRICE: `${item.price} ${this.translate.instant('EGP')}`,
          SOLD_UNITS: item.sold_units,
          IS_ACTIVE: item.is_active ? '✅' : '❌',
          CREATABLE_IN_BRANCHES: item.creatable_in_branches?.join(', ') || '—',
          USABLE_IN_BRANCHES: item.usable_in_branches?.join(', ') || '—',
          ID: item.id,
          rawData: item,
        }));
        this.filteredSubscriptions = [...this.subscriptions];
        this.isLoading = false;
      },
      error: () => {
        this.toaster.error(this.translate.instant('ERROR_FETCHING_SUBSCRIPTIONS'));
        this.isLoading = false;
      },
    });
  }

  searchSubscription(query: string) {
    this.searchSubject.next(query);
  }

  applySearch(query: string) {
    const q = query.toLowerCase().trim();
    if (!q) {
      this.filteredSubscriptions = [...this.subscriptions];
    } else {
      this.filteredSubscriptions = this.subscriptions.filter((s) =>
        s.SUBSCRIPTION_NAME?.toLowerCase().includes(q)
      );
    }
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(SubscriptionDialogComponent, {
      width: '600px',
      data: { isEdit: false },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.toaster.success(this.translate.instant('SUBSCRIPTION_CREATED'));
        this.getAllSubscriptions();
      }
    });
  }

  openEditDialog(row: any) {
    const dialogRef = this.dialog.open(SubscriptionDialogComponent, {
      width: '600px',
      data: { isEdit: true, subscription: row.rawData, id: row.ID },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.toaster.success(this.translate.instant('SUBSCRIPTION_UPDATED'));
        this.getAllSubscriptions();
      }
    });
  }
}
