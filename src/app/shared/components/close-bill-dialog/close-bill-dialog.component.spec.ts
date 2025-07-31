import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseBillDialogComponent } from './close-bill-dialog.component';

describe('CloseBillDialogComponent', () => {
  let component: CloseBillDialogComponent;
  let fixture: ComponentFixture<CloseBillDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CloseBillDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CloseBillDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
