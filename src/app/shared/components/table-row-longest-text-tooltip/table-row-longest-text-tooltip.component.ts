import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-table-row-longest-text-tooltip',
  templateUrl: './table-row-longest-text-tooltip.component.html',
  styleUrls: ['./table-row-longest-text-tooltip.component.css'],
})
export class TableRowLongestTextTooltipComponent {
  @Input() substringLength!: number;
  @Input() name!: string;
  @Input() showToolTip!: boolean;
  @Input() columnHover!: boolean;
}
