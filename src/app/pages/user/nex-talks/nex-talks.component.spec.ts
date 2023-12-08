import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NexTalksComponent } from './nex-talks.component';

describe('NexTalksComponent', () => {
  let component: NexTalksComponent;
  let fixture: ComponentFixture<NexTalksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NexTalksComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NexTalksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
