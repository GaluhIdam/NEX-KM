import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BestPracticePublishComponent } from './best-practice-publish.component';

describe('BestPracticePublishComponent', () => {
  let component: BestPracticePublishComponent;
  let fixture: ComponentFixture<BestPracticePublishComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BestPracticePublishComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BestPracticePublishComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
