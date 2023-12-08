import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PodcastLatestReleaseComponent } from './podcast-latest-release.component';

describe('PodcastLatestReleaseComponent', () => {
  let component: PodcastLatestReleaseComponent;
  let fixture: ComponentFixture<PodcastLatestReleaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PodcastLatestReleaseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PodcastLatestReleaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
