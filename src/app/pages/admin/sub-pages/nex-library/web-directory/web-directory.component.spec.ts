import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebDirectoryComponent } from './web-directory.component';

describe('WebDirectoryComponent', () => {
  let component: WebDirectoryComponent;
  let fixture: ComponentFixture<WebDirectoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WebDirectoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WebDirectoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
