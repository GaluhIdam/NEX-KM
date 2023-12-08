import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PodcastEditPodcastComponent } from './podcast-edit-podcast.component';

describe('PodcastEditPodcastComponent', () => {
  let component: PodcastEditPodcastComponent;
  let fixture: ComponentFixture<PodcastEditPodcastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PodcastEditPodcastComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PodcastEditPodcastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
