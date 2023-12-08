import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamFavoritesComponent } from './stream-favorites.component';

describe('StreamFavoritesComponent', () => {
  let component: StreamFavoritesComponent;
  let fixture: ComponentFixture<StreamFavoritesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StreamFavoritesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StreamFavoritesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
