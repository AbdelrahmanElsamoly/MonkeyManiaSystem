import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/guard/auth.guard';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/login' },
  {
    path: 'login',
    loadChildren: () =>
      import('./auth/login.module').then((m) => m.loginModule),
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard.module').then((m) => m.dashboardModule),
    canActivate: [AuthGuard], // ✅ Protect the dashboard route
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
