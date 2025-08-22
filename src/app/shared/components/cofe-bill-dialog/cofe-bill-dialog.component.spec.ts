import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CofeBillDialogComponent } from './cofe-bill-dialog.component';

describe('CofeBillDialogComponent', () => {
  let component: CofeBillDialogComponent;
  let fixture: ComponentFixture<CofeBillDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CofeBillDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CofeBillDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
