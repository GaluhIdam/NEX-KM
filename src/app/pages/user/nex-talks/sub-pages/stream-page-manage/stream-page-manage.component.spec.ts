import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamPageManageComponent } from './stream-page-manage.component';

describe('StreamPageManageComponent', () => {
  let component: StreamPageManageComponent;
  let fixture: ComponentFixture<StreamPageManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StreamPageManageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StreamPageManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
