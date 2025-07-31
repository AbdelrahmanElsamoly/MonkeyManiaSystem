import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchesDialogComponent } from './branches-dialog.component';

describe('BranchesDialogComponent', () => {
  let component: BranchesDialogComponent;
  let fixture: ComponentFixture<BranchesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BranchesDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BranchesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
