import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamUserComponent } from './stream-user.component';

describe('StreamUserComponent', () => {
  let component: StreamUserComponent;
  let fixture: ComponentFixture<StreamUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StreamUserComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StreamUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
