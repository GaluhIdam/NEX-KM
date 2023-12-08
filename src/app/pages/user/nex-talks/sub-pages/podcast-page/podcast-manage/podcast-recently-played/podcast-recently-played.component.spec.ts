import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PodcastRecentlyPlayedComponent } from './podcast-recently-played.component';

describe('PodcastRecentlyPlayedComponent', () => {
  let component: PodcastRecentlyPlayedComponent;
  let fixture: ComponentFixture<PodcastRecentlyPlayedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PodcastRecentlyPlayedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PodcastRecentlyPlayedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
