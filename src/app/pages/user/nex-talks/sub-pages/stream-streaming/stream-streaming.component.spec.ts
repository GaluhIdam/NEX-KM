import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamStreamingComponent } from './stream-streaming.component';

describe('StreamStreamingComponent', () => {
  let component: StreamStreamingComponent;
  let fixture: ComponentFixture<StreamStreamingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StreamStreamingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StreamStreamingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
