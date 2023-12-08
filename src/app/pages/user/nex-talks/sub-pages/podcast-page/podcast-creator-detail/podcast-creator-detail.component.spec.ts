import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PodcastCreatorDetailComponent } from './podcast-creator-detail.component';

describe('PodcastCreatorDetailComponent', () => {
  let component: PodcastCreatorDetailComponent;
  let fixture: ComponentFixture<PodcastCreatorDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PodcastCreatorDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PodcastCreatorDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
