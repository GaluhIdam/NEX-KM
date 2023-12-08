import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailRedeemedComponent } from './detail-redeemed.component';

describe('DetailRedeemedComponent', () => {
  let component: DetailRedeemedComponent;
  let fixture: ComponentFixture<DetailRedeemedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailRedeemedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailRedeemedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
