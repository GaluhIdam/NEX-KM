import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { faCircleCheck, faStar, faBan } from '@fortawesome/free-solid-svg-icons';
import { Modal, Ripple, initTE } from "tw-elements";

@Component({
  selector: 'app-button-modal-center',
  templateUrl: './button-modal-center.component.html',
  styleUrls: ['./button-modal-center.component.css']
})
export class ButtonModalCenterComponent implements OnInit, OnDestroy {
  ngOnInit(): void {
    initTE({ Modal, Ripple });
  }
  ngOnDestroy(): void {
  }
  faCircleCheck = faCircleCheck
  faStar = faStar
  faBan = faBan

  @Input() Approve: boolean = false
  @Input() Editor: boolean = false
  @Input() Ban: boolean = false
  @Input() uuid!: string;
}
