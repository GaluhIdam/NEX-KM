import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoGalleryCategoryComponent } from './photo-gallery-category.component';

describe('PhotoGalleryCategoryComponent', () => {
  let component: PhotoGalleryCategoryComponent;
  let fixture: ComponentFixture<PhotoGalleryCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhotoGalleryCategoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhotoGalleryCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
