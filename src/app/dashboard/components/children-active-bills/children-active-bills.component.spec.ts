import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChildrenActiveBillsComponent } from './children-active-bills.component';

describe('ChildrenActiveBillsComponent', () => {
  let component: ChildrenActiveBillsComponent;
  let fixture: ComponentFixture<ChildrenActiveBillsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChildrenActiveBillsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChildrenActiveBillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
