import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NexLibraryComponent } from './nex-library.component';

describe('NexLibraryComponent', () => {
  let component: NexLibraryComponent;
  let fixture: ComponentFixture<NexLibraryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NexLibraryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NexLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
