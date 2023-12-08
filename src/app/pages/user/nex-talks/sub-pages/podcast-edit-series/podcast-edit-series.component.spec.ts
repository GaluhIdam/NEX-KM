import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PodcastEditSeriesComponent } from './podcast-edit-series.component';

describe('PodcastEditSeriesComponent', () => {
  let component: PodcastEditSeriesComponent;
  let fixture: ComponentFixture<PodcastEditSeriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PodcastEditSeriesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PodcastEditSeriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
