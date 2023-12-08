import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyDirectoryComponent } from './my-directory.component';

describe('MyDirectoryComponent', () => {
  let component: MyDirectoryComponent;
  let fixture: ComponentFixture<MyDirectoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyDirectoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyDirectoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
