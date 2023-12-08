import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NexCommunityComponent } from './nex-community.component';

describe('NexCommunityComponent', () => {
  let component: NexCommunityComponent;
  let fixture: ComponentFixture<NexCommunityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NexCommunityComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NexCommunityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
