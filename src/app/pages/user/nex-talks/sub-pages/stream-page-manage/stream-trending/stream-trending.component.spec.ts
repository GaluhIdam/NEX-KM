import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamTrendingComponent } from './stream-trending.component';

describe('StreamTrendingComponent', () => {
  let component: StreamTrendingComponent;
  let fixture: ComponentFixture<StreamTrendingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StreamTrendingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StreamTrendingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
