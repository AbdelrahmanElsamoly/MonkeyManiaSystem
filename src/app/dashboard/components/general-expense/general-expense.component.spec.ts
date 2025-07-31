import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralExpenseComponent } from './general-expense.component';

describe('GeneralExpenseComponent', () => {
  let component: GeneralExpenseComponent;
  let fixture: ComponentFixture<GeneralExpenseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneralExpenseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneralExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
