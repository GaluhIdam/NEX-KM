import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatorPodcastComponent } from './creator-podcast.component';

describe('CreatorPodcastComponent', () => {
  let component: CreatorPodcastComponent;
  let fixture: ComponentFixture<CreatorPodcastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreatorPodcastComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatorPodcastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
