import { Component, Input, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-report-modal',
  templateUrl: './report-modal.component.html',
  styleUrls: ['./report-modal.component.css'],
})
export class ReportModalComponent implements OnInit, OnDestroy {
  @Input() uuid!: string;

  ngOnInit(): void {}
  ngOnDestroy(): void {}
}
