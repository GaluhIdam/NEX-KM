import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityActivityComponent } from './community-activity.component';

describe('CommunityActivityComponent', () => {
  let component: CommunityActivityComponent;
  let fixture: ComponentFixture<CommunityActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommunityActivityComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommunityActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
