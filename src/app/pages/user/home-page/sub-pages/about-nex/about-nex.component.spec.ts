import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutNexComponent } from './about-nex.component';

describe('AboutNexComponent', () => {
  let component: AboutNexComponent;
  let fixture: ComponentFixture<AboutNexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AboutNexComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AboutNexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
