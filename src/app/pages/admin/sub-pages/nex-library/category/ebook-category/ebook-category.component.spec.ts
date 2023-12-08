import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EbookCategoryComponent } from './ebook-category.component';

describe('EbookCategoryComponent', () => {
  let component: EbookCategoryComponent;
  let fixture: ComponentFixture<EbookCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EbookCategoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EbookCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
