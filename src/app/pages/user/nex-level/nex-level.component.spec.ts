import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NexLevelComponent } from './nex-level.component';

describe('NexLevelComponent', () => {
  let component: NexLevelComponent;
  let fixture: ComponentFixture<NexLevelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NexLevelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NexLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
