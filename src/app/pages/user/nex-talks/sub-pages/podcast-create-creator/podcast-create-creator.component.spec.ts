import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PodcastCreateCreatorComponent } from './podcast-create-creator.component';

describe('PodcastCreateCreatorComponent', () => {
  let component: PodcastCreateCreatorComponent;
  let fixture: ComponentFixture<PodcastCreateCreatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PodcastCreateCreatorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PodcastCreateCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
