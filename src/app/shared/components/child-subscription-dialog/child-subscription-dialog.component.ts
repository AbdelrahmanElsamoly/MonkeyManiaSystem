import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DashboardService } from 'src/app/dashboard/dashboard.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-child-subscription-dialog',
  templateUrl: './child-subscription-dialog.component.html',
  styleUrls: ['./child-subscription-dialog.component.scss'],
})
export class ChildSubscriptionDialogComponent implements OnInit, OnDestroy {
  currentBranch = JSON.parse(localStorage.getItem('branch') || '{}');
  subscriptions: any[] = [];
  filteredSubscriptions: any[] = [];
  children: any[] = [];
  isLoading = false;

  childSearchValue = '';
  subscriptionSearchValue = '';

  private childSearchSubject = new Subject<string>();

  form = {
    cash: 0,
    visa: 0,
    instapay: 0,
    subscription: null as number | null,
    child: null as number | null,
    branch: null as number | null,
  };

  constructor(
    private dialogRef: MatDialogRef<ChildSubscriptionDialogComponent>,
    private dashboardService: DashboardService,
    private toaster: ToastrService,
    private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit(): void {
    this.loadSubscriptions();
    this.loadChildren('');

    this.childSearchSubject
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((query) => this.loadChildren(query));

    if (this.data.isEdit && this.data.instance) {
      const s = this.data.instance;
      this.form.cash = parseFloat(s.cash) || 0;
      this.form.visa = parseFloat(s.visa) || 0;
      this.form.instapay = parseFloat(s.instapay) || 0;
      this.form.subscription = s.subscription_id;
      this.form.child = s.child_id;
      this.form.branch = s.branch_id;
    } else {
      this.form.branch = this.currentBranch?.id ?? null;
    }
  }

  ngOnDestroy(): void {
    this.childSearchSubject.complete();
  }

  loadSubscriptions() {
    this.dashboardService.getAllSubscriptions().subscribe({
      next: (res: any) => {
        this.subscriptions = res;
        this.filteredSubscriptions = [...res];
      },
    });
  }

  loadChildren(search: string) {
    this.dashboardService.getChild(search, 1).subscribe({
      next: (res: any) => (this.children = res.results ?? res),
    });
  }

  onChildSearchInput(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    this.childSearchSubject.next(query);
  }

  onChildSearchKeydown(event: KeyboardEvent) {
    event.stopPropagation();
  }

  onSubscriptionSearchInput(event: Event) {
    const q = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.filteredSubscriptions = q
      ? this.subscriptions.filter((s) => s.name?.toLowerCase().includes(q))
      : [...this.subscriptions];
  }

  onSubscriptionSearchKeydown(event: KeyboardEvent) {
    event.stopPropagation();
  }

  get isFormValid(): boolean {
    return !!(
      this.form.subscription != null &&
      this.form.child != null &&
      this.form.branch != null
    );
  }

  onSave() {
    if (!this.isFormValid) return;
    this.isLoading = true;

    const body = {
      cash: this.form.cash,
      visa: this.form.visa,
      instapay: this.form.instapay,
      subscription: this.form.subscription,
      child: this.form.child,
      branch: this.form.branch,
    };

    const request$ = this.data.isEdit
      ? this.dashboardService.updateSubscriptionInstance(this.data.id, body)
      : this.dashboardService.createSubscriptionInstance(body);

    request$.subscribe({
      next: () => {
        this.isLoading = false;
        this.dialogRef.close(true);
      },
      error: () => {
        this.isLoading = false;
        this.toaster.error(this.translate.instant('ERROR'));
      },
    });
  }

  onClose() {
    this.dialogRef.close(false);
  }
}
