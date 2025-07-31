import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchMultiSelectComponent } from './branch-multi-select.component';

describe('BranchMultiSelectComponent', () => {
  let component: BranchMultiSelectComponent;
  let fixture: ComponentFixture<BranchMultiSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BranchMultiSelectComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BranchMultiSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
