import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CofeOrderComponent } from './cofe-order.component';

describe('CofeOrderComponent', () => {
  let component: CofeOrderComponent;
  let fixture: ComponentFixture<CofeOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CofeOrderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CofeOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
