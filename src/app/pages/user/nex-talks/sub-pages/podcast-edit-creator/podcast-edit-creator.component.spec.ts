import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PodcastEditCreatorComponent } from './podcast-edit-creator.component';

describe('PodcastEditCreatorComponent', () => {
  let component: PodcastEditCreatorComponent;
  let fixture: ComponentFixture<PodcastEditCreatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PodcastEditCreatorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PodcastEditCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
