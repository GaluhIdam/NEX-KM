import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublishDirectoryComponent } from './publish-directory.component';

describe('PublishDirectoryComponent', () => {
  let component: PublishDirectoryComponent;
  let fixture: ComponentFixture<PublishDirectoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PublishDirectoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublishDirectoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
