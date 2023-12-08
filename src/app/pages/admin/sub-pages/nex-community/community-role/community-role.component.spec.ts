import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityRoleComponent } from './community-role.component';

describe('CommunityRoleComponent', () => {
  let component: CommunityRoleComponent;
  let fixture: ComponentFixture<CommunityRoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommunityRoleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommunityRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
