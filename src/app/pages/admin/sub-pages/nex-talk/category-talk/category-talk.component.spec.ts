import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryTalkComponent } from './category-talk.component';

describe('CategoryTalkComponent', () => {
  let component: CategoryTalkComponent;
  let fixture: ComponentFixture<CategoryTalkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CategoryTalkComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoryTalkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
