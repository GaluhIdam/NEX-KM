import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NexTeamComponent } from './nex-team.component';

describe('NexTeamComponent', () => {
  let component: NexTeamComponent;
  let fixture: ComponentFixture<NexTeamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NexTeamComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NexTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
