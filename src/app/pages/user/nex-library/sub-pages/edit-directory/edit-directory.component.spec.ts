import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDirectoryComponent } from './edit-directory.component';

describe('EditDirectoryComponent', () => {
  let component: EditDirectoryComponent;
  let fixture: ComponentFixture<EditDirectoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditDirectoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditDirectoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
