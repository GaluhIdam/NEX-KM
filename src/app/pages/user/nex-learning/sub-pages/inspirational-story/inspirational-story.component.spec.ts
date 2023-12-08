import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InspirationalStoryComponent } from './inspirational-story.component';

describe('InspirationalStoryComponent', () => {
  let component: InspirationalStoryComponent;
  let fixture: ComponentFixture<InspirationalStoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InspirationalStoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InspirationalStoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
