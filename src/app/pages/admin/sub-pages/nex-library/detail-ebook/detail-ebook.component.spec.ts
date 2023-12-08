import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailEbookComponent } from './detail-ebook.component';

describe('DetailEbookComponent', () => {
  let component: DetailEbookComponent;
  let fixture: ComponentFixture<DetailEbookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailEbookComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailEbookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
