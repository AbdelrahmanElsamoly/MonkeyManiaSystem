import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { SideNavComponent } from './components/side-nav/side-nav.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { DataTableComponent } from './components/data-table/data-table.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { SchoolDialogComponent } from './components/school-dialog/school-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PrintBtnComponent } from './components/print-btn/print-btn.component';
import { LoaderComponent } from './components/loader/loader.component';
import { CarouselComponent } from './components/carousel/carousel.component';
import { BranchMultiSelectComponent } from './components/branch-multi-select/branch-multi-select.component';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ExpenseDialogComponent } from './components/expense-dialog/expense-dialog.component';
import { MatInputModule } from '@angular/material/input';
import { BranchesDialogComponent } from './components/branches-dialog/branches-dialog.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CsvUploaderComponent } from './components/csv-uploader/csv-uploader.component';
import { ChildDialogComponent } from './components/child-dialog/child-dialog.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CloseBillDialogComponent } from './components/close-bill-dialog/close-bill-dialog.component';
import { CreateBillDialogComponent } from './components/create-bill-dialog/create-bill-dialog.component';
import { MapSelectedChildrenPipe } from './pipes/map-selected-children.pipe';
import { MatChipsModule } from '@angular/material/chips';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    SideNavComponent,
    DataTableComponent,
    SchoolDialogComponent,
    PrintBtnComponent,
    LoaderComponent,
    CarouselComponent,
    BranchMultiSelectComponent,
    ExpenseDialogComponent,
    BranchesDialogComponent,
    CsvUploaderComponent,
    ChildDialogComponent,
    CloseBillDialogComponent,
    CreateBillDialogComponent,
    MapSelectedChildrenPipe,
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    FormsModule,
    MatIconModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatAutocompleteModule,
    MatTableModule,
    MatChipsModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    HttpClientModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    RouterModule,
    MatListModule,
    MatButtonModule,
    MatExpansionModule,
    MatRadioModule,
    ReactiveFormsModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  exports: [
    SideNavComponent,
    DataTableComponent,
    SchoolDialogComponent,
    PrintBtnComponent,
    LoaderComponent,
    CarouselComponent,
    BranchMultiSelectComponent,
    CsvUploaderComponent,
    ChildDialogComponent,
    CloseBillDialogComponent,
  ],
})
export class SharedModule {}
