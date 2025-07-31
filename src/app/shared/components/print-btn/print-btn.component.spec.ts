import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintBtnComponent } from './print-btn.component';

describe('PrintBtnComponent', () => {
  let component: PrintBtnComponent;
  let fixture: ComponentFixture<PrintBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrintBtnComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrintBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
