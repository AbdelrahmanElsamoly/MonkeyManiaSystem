import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChildrenBillsComponent } from './children-bills.component';

describe('ChildrenBillsComponent', () => {
  let component: ChildrenBillsComponent;
  let fixture: ComponentFixture<ChildrenBillsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChildrenBillsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChildrenBillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
