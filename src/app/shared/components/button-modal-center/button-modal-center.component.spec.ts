import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonModalCenterComponent } from './button-modal-center.component';

describe('ButtonModalCenterComponent', () => {
  let component: ButtonModalCenterComponent;
  let fixture: ComponentFixture<ButtonModalCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ButtonModalCenterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonModalCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
