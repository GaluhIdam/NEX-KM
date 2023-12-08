import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PodcastManageComponent } from './podcast-manage.component';

describe('PodcastManageComponent', () => {
  let component: PodcastManageComponent;
  let fixture: ComponentFixture<PodcastManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PodcastManageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PodcastManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
