import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PodcastUploadPodcastComponent } from './podcast-upload-podcast.component';

describe('PodcastUploadPodcastComponent', () => {
  let component: PodcastUploadPodcastComponent;
  let fixture: ComponentFixture<PodcastUploadPodcastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PodcastUploadPodcastComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PodcastUploadPodcastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
