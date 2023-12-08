import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadBookModalComponent } from './read-book-modal.component';

describe('ReadBookModalComponent', () => {
  let component: ReadBookModalComponent;
  let fixture: ComponentFixture<ReadBookModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReadBookModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReadBookModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
