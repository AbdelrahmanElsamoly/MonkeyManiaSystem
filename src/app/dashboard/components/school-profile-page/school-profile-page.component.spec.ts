import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolProfilePageComponent } from './school-profile-page.component';

describe('ProfilePageComponent', () => {
  let component: SchoolProfilePageComponent;
  let fixture: ComponentFixture<SchoolProfilePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SchoolProfilePageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SchoolProfilePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
