import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BestPracticeViewComponent } from './best-practice-view.component';

describe('BestPracticeViewComponent', () => {
  let component: BestPracticeViewComponent;
  let fixture: ComponentFixture<BestPracticeViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BestPracticeViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BestPracticeViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
