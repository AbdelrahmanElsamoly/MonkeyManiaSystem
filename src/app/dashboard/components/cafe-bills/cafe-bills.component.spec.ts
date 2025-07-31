import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CafeBillsComponent } from './cafe-bills.component';

describe('CafeBillsComponent', () => {
  let component: CafeBillsComponent;
  let fixture: ComponentFixture<CafeBillsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CafeBillsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CafeBillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
