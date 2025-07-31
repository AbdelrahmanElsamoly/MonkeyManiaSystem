import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChildBillComponent } from './child-bill.component';

describe('ChildBillComponent', () => {
  let component: ChildBillComponent;
  let fixture: ComponentFixture<ChildBillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChildBillComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChildBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
