import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBillDialogComponent } from './edit-bill-dialog.component';

describe('EditBillDialogComponent', () => {
  let component: EditBillDialogComponent;
  let fixture: ComponentFixture<EditBillDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditBillDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditBillDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
