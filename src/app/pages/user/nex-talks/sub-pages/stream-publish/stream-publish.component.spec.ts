import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamPublishComponent } from './stream-publish.component';

describe('StreamPublishComponent', () => {
  let component: StreamPublishComponent;
  let fixture: ComponentFixture<StreamPublishComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StreamPublishComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StreamPublishComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
