import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BestPracticeComponent } from './best-practice.component';

describe('BestPracticeComponent', () => {
  let component: BestPracticeComponent;
  let fixture: ComponentFixture<BestPracticeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BestPracticeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BestPracticeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
