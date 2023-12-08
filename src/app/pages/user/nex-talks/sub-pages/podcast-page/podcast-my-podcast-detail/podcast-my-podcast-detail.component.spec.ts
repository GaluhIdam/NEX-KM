import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PodcastMyPodcastDetailComponent } from './podcast-my-podcast-detail.component';

describe('PodcastMyPodcastDetailComponent', () => {
  let component: PodcastMyPodcastDetailComponent;
  let fixture: ComponentFixture<PodcastMyPodcastDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PodcastMyPodcastDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PodcastMyPodcastDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
