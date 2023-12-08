import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeriesPodcastComponent } from './series-podcast.component';

describe('SeriesPodcastComponent', () => {
  let component: SeriesPodcastComponent;
  let fixture: ComponentFixture<SeriesPodcastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SeriesPodcastComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeriesPodcastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
