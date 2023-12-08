import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageDirectoryComponent } from './manage-directory.component';

describe('ManageDirectoryComponent', () => {
  let component: ManageDirectoryComponent;
  let fixture: ComponentFixture<ManageDirectoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageDirectoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageDirectoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
