import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialExpenseComponent } from './material-expense.component';

describe('MaterialExpenseComponent', () => {
  let component: MaterialExpenseComponent;
  let fixture: ComponentFixture<MaterialExpenseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaterialExpenseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaterialExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
