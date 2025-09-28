import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SchoolsComponent } from './components/schools/schools.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { StaffComponent } from './components/staff/staff.component';
import { UserComponent } from './components/user/user.component';
import { SalesComponent } from './components/sales/sales.component';
import { ChildrenComponent } from './components/children/children.component';
import { SchoolProfilePageComponent } from './components/school-profile-page/school-profile-page.component';
import { ChildProfileComponent } from './components/child-profile/child-profile.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { GeneralExpenseComponent } from './components/general-expense/general-expense.component';
import { MaterialExpenseComponent } from './components/material-expense/material-expense.component';
import { ExpenseComponent } from './components/expense/expense.component';
import { ChildrenBillsComponent } from './components/children-bills/children-bills.component';
import { ChildrenActiveBillsComponent } from './components/children-active-bills/children-active-bills.component';
import { CafeActiveBillsComponent } from './components/cafe-active-bills/cafe-active-bills.component';
import { CafeBillsComponent } from './components/cafe-bills/cafe-bills.component';
import { ChildBillComponent } from './components/child-bill/child-bill.component';
import { CofeOrderComponent } from './components/cofe-order/cofe-order.component';
import { CofeBillDialogComponent } from '../shared/components/cofe-bill-dialog/cofe-bill-dialog.component';
import { FlowChartComponent } from './components/flow-chart/flow-chart/flow-chart.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'main', pathMatch: 'full' },
      { path: 'main', component: MainPageComponent },
      { path: 'school', component: SchoolsComponent },
      { path: 'staff', component: StaffComponent },
      { path: 'general/expense', component: GeneralExpenseComponent },
      { path: 'material/expense', component: MaterialExpenseComponent },
      { path: 'user', component: UserComponent },
      { path: 'sales', component: SalesComponent },
      { path: 'child', component: ChildrenComponent },
      { path: 'order', component: CofeOrderComponent },
      { path: 'flow-chart', component: FlowChartComponent },
      {
        path: 'bills',
        children: [
          { path: 'children/active', component: ChildrenActiveBillsComponent },
          { path: 'children/all', component: ChildrenBillsComponent },
          { path: 'cafe/active', component: CafeActiveBillsComponent },
          { path: 'cafe/all', component: CafeBillsComponent },
          { path: 'child/:id', component: ChildBillComponent },
        ],
      },
      { path: 'school/:id', component: SchoolProfilePageComponent },
      { path: 'child/:id', component: ChildProfileComponent },
      { path: 'user/:id', component: UserProfileComponent },
      { path: 'expense/:id', component: ExpenseComponent },
      {
        path: 'cofe-bill/:id',
        component: CofeBillDialogComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
