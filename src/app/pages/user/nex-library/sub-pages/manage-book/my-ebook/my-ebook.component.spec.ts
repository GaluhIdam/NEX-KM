import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyEbookComponent } from './my-ebook.component';

describe('MyEbookComponent', () => {
  let component: MyEbookComponent;
  let fixture: ComponentFixture<MyEbookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MyEbookComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MyEbookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
