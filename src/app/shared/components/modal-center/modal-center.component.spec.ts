import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCenterComponent } from './modal-center.component';

describe('ModalCenterComponent', () => {
  let component: ModalCenterComponent;
  let fixture: ComponentFixture<ModalCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalCenterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
