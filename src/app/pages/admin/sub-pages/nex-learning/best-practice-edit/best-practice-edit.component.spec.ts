import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BestPracticeEditComponent } from './best-practice-edit.component';

describe('BestPracticeEditComponent', () => {
  let component: BestPracticeEditComponent;
  let fixture: ComponentFixture<BestPracticeEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BestPracticeEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BestPracticeEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
