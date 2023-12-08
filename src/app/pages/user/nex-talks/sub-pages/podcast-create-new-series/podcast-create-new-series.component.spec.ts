import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PodcastCreateNewSeriesComponent } from './podcast-create-new-series.component';

describe('PodcastCreateNewSeriesComponent', () => {
  let component: PodcastCreateNewSeriesComponent;
  let fixture: ComponentFixture<PodcastCreateNewSeriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PodcastCreateNewSeriesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PodcastCreateNewSeriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
