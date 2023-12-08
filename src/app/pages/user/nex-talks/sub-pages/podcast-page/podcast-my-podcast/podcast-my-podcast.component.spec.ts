import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PodcastMyPodcastComponent } from './podcast-my-podcast.component';

describe('PodcastMyPodcastComponent', () => {
  let component: PodcastMyPodcastComponent;
  let fixture: ComponentFixture<PodcastMyPodcastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PodcastMyPodcastComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PodcastMyPodcastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
