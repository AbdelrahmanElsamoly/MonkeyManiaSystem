import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CafeActiveBillsComponent } from './cafe-active-bills.component';

describe('CafeActiveBillsComponent', () => {
  let component: CafeActiveBillsComponent;
  let fixture: ComponentFixture<CafeActiveBillsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CafeActiveBillsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CafeActiveBillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
