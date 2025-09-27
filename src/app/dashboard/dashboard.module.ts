import { NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import localeAr from '@angular/common/locales/ar';
import { LOCALE_ID } from '@angular/core';

// Angular Material
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';

// i18n
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// Shared + Routing
import { SharedModule } from '../shared/shared.module';

// Components
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { SalesComponent } from './components/sales/sales.component';
import { UserComponent } from './components/user/user.component';
import { StaffComponent } from './components/staff/staff.component';
import { ChildrenComponent } from './components/children/children.component';
import { SchoolsComponent } from './components/schools/schools.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SchoolProfilePageComponent } from './components/school-profile-page/school-profile-page.component';
import { ChildProfileComponent } from './components/child-profile/child-profile.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { GeneralExpenseComponent } from './components/general-expense/general-expense.component';
import { MaterialExpenseComponent } from './components/material-expense/material-expense.component';
import { ExpenseComponent } from './components/expense/expense.component';
import { ChildrenBillsComponent } from './components/children-bills/children-bills.component';
import { ChildrenActiveBillsComponent } from './components/children-active-bills/children-active-bills.component';
import { CafeBillsComponent } from './components/cafe-bills/cafe-bills.component';
import { CafeActiveBillsComponent } from './components/cafe-active-bills/cafe-active-bills.component';
import { ChildBillComponent } from './components/child-bill/child-bill.component';
import { CofeOrderComponent } from './components/cofe-order/cofe-order.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

registerLocaleData(localeAr);
@NgModule({
  declarations: [
    DashboardComponent,
    MainPageComponent,
    SalesComponent,
    UserComponent,
    StaffComponent,
    ChildrenComponent,
    SchoolsComponent,
    SchoolProfilePageComponent,
    ChildProfileComponent,
    UserProfileComponent,
    GeneralExpenseComponent,
    MaterialExpenseComponent,
    ExpenseComponent,
    ChildrenBillsComponent,
    ChildrenActiveBillsComponent,
    CafeBillsComponent,
    CafeActiveBillsComponent,
    ChildBillComponent,
    CofeOrderComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule,
    DashboardRoutingModule,
    SharedModule,
    FormsModule,
    CarouselModule,
    ReactiveFormsModule,
    // Material
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatInputModule,
    // Translate
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'ar-EG' }],
})
export class dashboardModule {}
