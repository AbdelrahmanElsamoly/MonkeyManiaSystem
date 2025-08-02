import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromoCodeDialogComponent } from './promo-code-dialog.component';

describe('PromoCodeDialogComponent', () => {
  let component: PromoCodeDialogComponent;
  let fixture: ComponentFixture<PromoCodeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PromoCodeDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromoCodeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
