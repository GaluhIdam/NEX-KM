import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublishBookComponent } from './publish-book.component';

describe('PublishBookComponent', () => {
  let component: PublishBookComponent;
  let fixture: ComponentFixture<PublishBookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PublishBookComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublishBookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
