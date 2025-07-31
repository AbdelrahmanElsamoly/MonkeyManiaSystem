import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateBillDialogComponent } from './create-bill-dialog.component';

describe('CreateBillDialogComponent', () => {
  let component: CreateBillDialogComponent;
  let fixture: ComponentFixture<CreateBillDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateBillDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateBillDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
