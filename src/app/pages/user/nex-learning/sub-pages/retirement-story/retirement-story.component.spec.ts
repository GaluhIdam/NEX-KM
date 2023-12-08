import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetirementStoryComponent } from './retirement-story.component';

describe('RetirementStoryComponent', () => {
  let component: RetirementStoryComponent;
  let fixture: ComponentFixture<RetirementStoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RetirementStoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RetirementStoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
