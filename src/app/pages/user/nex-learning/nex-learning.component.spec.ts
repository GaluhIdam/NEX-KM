import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NexLearningComponent } from './nex-learning.component';

describe('NexLearningComponent', () => {
  let component: NexLearningComponent;
  let fixture: ComponentFixture<NexLearningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NexLearningComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NexLearningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
