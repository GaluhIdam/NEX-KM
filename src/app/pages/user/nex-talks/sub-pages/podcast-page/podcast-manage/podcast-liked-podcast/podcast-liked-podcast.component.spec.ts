import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PodcastLikedPodcastComponent } from './podcast-liked-podcast.component';

describe('PodcastLikedPodcastComponent', () => {
  let component: PodcastLikedPodcastComponent;
  let fixture: ComponentFixture<PodcastLikedPodcastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PodcastLikedPodcastComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PodcastLikedPodcastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
