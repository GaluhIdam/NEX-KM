import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InspirationStoryComponent } from './inspiration-story.component';

describe('InspirationStoryComponent', () => {
  let component: InspirationStoryComponent;
  let fixture: ComponentFixture<InspirationStoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InspirationStoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InspirationStoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
