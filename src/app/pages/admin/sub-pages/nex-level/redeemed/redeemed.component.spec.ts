import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedeemedComponent } from './redeemed.component';

describe('RedeemedComponent', () => {
  let component: RedeemedComponent;
  let fixture: ComponentFixture<RedeemedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RedeemedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RedeemedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
