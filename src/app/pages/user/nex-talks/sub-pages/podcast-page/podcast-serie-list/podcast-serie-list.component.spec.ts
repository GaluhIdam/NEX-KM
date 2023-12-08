import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PodcastSerieListComponent } from './podcast-serie-list.component';

describe('PodcastSerieListComponent', () => {
  let component: PodcastSerieListComponent;
  let fixture: ComponentFixture<PodcastSerieListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PodcastSerieListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PodcastSerieListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
