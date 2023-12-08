import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharingExperienceComponent } from './sharing-experience.component';

describe('SharingExperienceComponent', () => {
  let component: SharingExperienceComponent;
  let fixture: ComponentFixture<SharingExperienceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SharingExperienceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharingExperienceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
