import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableRowLongestTextTooltipComponent } from './table-row-longest-text-tooltip.component';

describe('TableRowLongestTextTooltipComponent', () => {
  let component: TableRowLongestTextTooltipComponent;
  let fixture: ComponentFixture<TableRowLongestTextTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TableRowLongestTextTooltipComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableRowLongestTextTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
