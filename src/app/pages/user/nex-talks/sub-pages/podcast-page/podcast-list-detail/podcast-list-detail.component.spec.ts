import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PodcastListDetailComponent } from './podcast-list-detail.component';

describe('PodcastListDetailComponent', () => {
  let component: PodcastListDetailComponent;
  let fixture: ComponentFixture<PodcastListDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PodcastListDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PodcastListDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
