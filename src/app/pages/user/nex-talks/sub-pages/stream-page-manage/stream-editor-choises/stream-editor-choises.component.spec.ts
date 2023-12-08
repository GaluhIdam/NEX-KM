import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamEditorChoisesComponent } from './stream-editor-choises.component';

describe('StreamEditorChoisesComponent', () => {
  let component: StreamEditorChoisesComponent;
  let fixture: ComponentFixture<StreamEditorChoisesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StreamEditorChoisesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StreamEditorChoisesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
