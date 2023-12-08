import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceErrorComponent } from './service-error.component';

describe('ServiceErrorComponent', () => {
  let component: ServiceErrorComponent;
  let fixture: ComponentFixture<ServiceErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServiceErrorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
