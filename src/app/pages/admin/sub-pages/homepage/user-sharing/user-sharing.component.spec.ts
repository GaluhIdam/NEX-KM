import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSharingComponent } from './user-sharing.component';

describe('UserSharingComponent', () => {
  let component: UserSharingComponent;
  let fixture: ComponentFixture<UserSharingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserSharingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserSharingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
