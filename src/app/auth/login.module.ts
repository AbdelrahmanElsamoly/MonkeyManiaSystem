import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './components/components/login.component';
import { RouterModule, Routes } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { BranchesComponent } from './commponents/branches/branches.component';
import { MatRadioModule } from '@angular/material/radio';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: LoginComponent,
  },
  {
    path: 'branches',
    component: BranchesComponent,
  },
];

@NgModule({
  declarations: [LoginComponent, BranchesComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    MatRadioModule,
    ToastrModule.forRoot(),
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  exports: [LoginComponent],
})
export class loginModule {}
