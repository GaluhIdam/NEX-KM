import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NexTeamListComponent } from './nex-team-list.component';

describe('NexTeamListComponent', () => {
  let component: NexTeamListComponent;
  let fixture: ComponentFixture<NexTeamListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NexTeamListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NexTeamListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
