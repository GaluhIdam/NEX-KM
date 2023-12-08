import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Modal, Ripple, initTE } from "tw-elements";
import { faArrowRight, faBell, faGear, faSearch, faFilter, faPrint, faCircleCheck, faEye, faStar, faBan, faXmark, faPencil, faPlus, faTrash, faBookmark } from '@fortawesome/free-solid-svg-icons';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
interface ButtonDTO {
  show?: boolean
  text?: string
}
@Component({
  selector: 'app-modal-center',
  templateUrl: './modal-center.component.html',
  styleUrls: ['./modal-center.component.css']
})
export class ModalCenterComponent implements OnInit, OnDestroy {

  form: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      descStatus: ['', Validators.required]
    });
    this.form.valueChanges.subscribe((value) => {
      this.formData.emit(value);
    });
  }

  @Output() saveClick: EventEmitter<void> = new EventEmitter<void>();
  @Output() rejectClick: EventEmitter<void> = new EventEmitter<void>();
  @Output() editorClick: EventEmitter<void> = new EventEmitter<void>();
  @Output() banClick: EventEmitter<void> = new EventEmitter<void>();

  @Input() uuid!: string;
  @Output() formData: EventEmitter<any> = new EventEmitter<any>();
  @Input() modalTitleApprove: string = 'Confirm Approval or Rejection';
  modalTitleEditor: string = 'Editor Choice Confirmation';
  modalTitleBan: string = 'Confirm Deactivation';
  @Input() modalContentApprove: string = 'Content Approve';
  @Input() modalContentEditor: string = 'Content Editor';
  @Input() modalContentBan: string = 'Content Ban';
  @Input() cancelBtn: boolean = true;
  @Input() Approve: boolean = false
  @Input() Editor: boolean = false
  @Input() Ban: boolean = false
  @Input() saveButton: ButtonDTO = {
    show: true,
    text: 'Save'
  }
  @Input() rejectButton: ButtonDTO = {
    show: true,
    text: 'Reject'
  }

  @Input() lgsgReject: boolean = false;

  messageReject: boolean = false

  faCircleCheck = faCircleCheck
  faStar = faStar
  faTrash = faTrash
  faBan = faBan
  ngOnDestroy(): void {
  }
  ngOnInit(): void {
    initTE({ Modal, Ripple });
  }

  clickSave(): void {
    this.saveClick.emit();
  }

  clickReject(): void {
    this.rejectClick.emit();
  }

  clickEditor(): void {
    this.editorClick.emit();
  }

  clickBan(): void {
    this.banClick.emit();
  }

  switch(): void {
    this.messageReject = true
  }
  closeModal(): void {
    this.form.get('descStatus')?.reset();
    this.messageReject = false
  }
}
