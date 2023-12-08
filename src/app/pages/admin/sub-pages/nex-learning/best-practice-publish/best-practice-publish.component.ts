import { BestPracticePublishDTO } from './../../../../user/nex-learning/dtos/best-practice.dto';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import { NexLearningService } from 'src/app/pages/user/nex-learning/nex-learning.service';
import {
  faArrowRight,
  faBookBookmark,
  faBookOpen,
  faCommentDots,
  faSearch,
  faCheckCircle,
  faXmark,
  faQuestion,
} from '@fortawesome/free-solid-svg-icons';
import { StatusDTO } from 'src/app/pages/user/nex-learning/dtos/status.dto';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SummernoteOptions } from 'ngx-summernote/lib/summernote-options';
import Swal from 'sweetalert2';
import { Select, initTE } from 'tw-elements';

@Component({
  selector: 'app-best-practice-publish',
  templateUrl: './best-practice-publish.component.html',
  styleUrls: ['./best-practice-publish.component.css'],
})
export class BestPracticePublishComponent
  extends BaseController
  implements OnInit, OnDestroy
{
  constructor(
    private readonly router: Router,
    private readonly nexLearningService: NexLearningService,
    private readonly keycloakService: KeycloakService
  ) {
    super(BestPracticePublishComponent.name);
  }
  ngOnInit(): void {
    initTE({ Select });
    this.getUserData();
  }
  ngOnDestroy(): void {}

  imageShow: string =
    '../../../../../../assets/image/best-practice/best-practice-350X500.jpeg';
  faSearch = faSearch;
  faArrowRight = faArrowRight;
  faBookBookmark = faBookBookmark;
  faBookOpen = faBookOpen;
  faCheckCircle = faCheckCircle;
  faXmark = faXmark;
  faQuestion = faQuestion;
  faComment = faCommentDots;

  loading: boolean = true;

  image!: File;
  //Image Validation
  imageValidator!: boolean;
  imageValidatorMessage!: string;

  //Option Status
  statusEditorChoice: Array<StatusDTO> = [
    {
      name: 'No',
      status: false,
    },
    {
      name: 'Yes',
      status: true,
    },
  ];
  statusApproveList: Array<StatusDTO> = [
    {
      name: 'Waiting Approval',
      status: null,
    },
    {
      name: 'Approve',
      status: true,
    },
    {
      name: 'Reject',
      status: false,
    },
  ];
  favoriteList: Array<StatusDTO> = [
    {
      name: 'No',
      status: false,
    },
    {
      name: 'Yes',
      status: true,
    },
  ];

  progress: number = 0;

  mform: FormGroup = new FormGroup({
    title: new FormControl('', [Validators.required]),
    image: new FormControl('', [Validators.required]),
    unit: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    dateCreated: new FormControl('', [Validators.required]),
    createdBy: new FormControl('', [Validators.required]),
    editorChoice: new FormControl(this.statusEditorChoice[0].status),
    favorite: new FormControl(this.favoriteList[0].status),
    statusApprove: new FormControl(this.statusApproveList[0].status),
    approvalBy: new FormControl(''),
  });

  //Summernote Config
  config: SummernoteOptions = {
    placeholder: 'type your content',
    tabsize: 2,
    height: 500,
    toolbar: [
      ['misc', ['codeview', 'undo', 'redo']],
      ['style', ['bold', 'italic', 'underline', 'clear']],
      [
        'font',
        [
          'bold',
          'italic',
          'underline',
          'strikethrough',
          'superscript',
          'subscript',
          'clear',
        ],
      ],
      ['fontsize', ['fontname', 'fontsize', 'color']],
      ['para', ['style', 'ul', 'ol', 'paragraph', 'height']],
      ['insert', ['link', 'hr']],
    ],
    fontNames: [
      'Helvetica',
      'Arial',
      'Arial Black',
      'Comic Sans MS',
      'Courier New',
      'Roboto',
      'Times',
    ],
  };
  //Summernote Config

  async postBestPractice(): Promise<void> {
    try {
      if (this.mform.valid && this.imageValidator) {
        this.nexLearningService
          .getUser(this.keycloakService.getUsername())
          .subscribe((response) => {
            const dto: BestPracticePublishDTO = {
              personalNumber: this.keycloakService.getUsername(),
              title: this.mform.get('title')?.value,
              content: this.mform.get('description')?.value,
              image: this.image,
              uploadBy: response.personalName,
              unit: this.mform.get('unit')?.value,
            };
            this.nexLearningService.createBestPractice(dto).subscribe(() => {
              Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Your best practice was successfully created.',
                timer: 1000,
                showConfirmButton: false,
              }).then(() => {
                this.router.navigate(['/admin/best-practice']);
              });
            });
          });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Please check your data before submit.',
          timer: 1000,
          showConfirmButton: false,
        }).then(() => {
          Object.keys(this.mform.controls).forEach((key) => {
            const control = this.mform.get(key);
            if (control?.invalid) {
              control.markAsTouched();
            }
          });
        });
      }
    } catch (error) {
      throw error;
    }
  }

  async getUserData(): Promise<void> {
    try {
      this.nexLearningService
        .getUser(this.keycloakService.getUsername())
        .subscribe((data) => {
          this.mform.get('createdBy')?.setValue(data.personalName);
          this.mform.get('unit')?.setValue(data.personalUnit);
          this.mform.get('createdBy')?.disable();
          this.mform.get('unit')?.disable();
          this.mform.get('favorite')?.disable();
          this.mform.get('editorChoice')?.disable();
          this.mform.get('statusApprove')?.disable();
          this.mform.get('approvalBy')?.disable();
          const today = new Date();
          this.mform.get('dateCreated')?.setValue(this.formatDateNow(today));
          this.mform.get('dateCreated')?.disable();
          this.loading = false;
        });
    } catch (error) {
      throw error;
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    this.image = file;
    this.imageValidation(this.image, 1).then((data) => {
      this.imageValidator = data.status;
      this.imageValidatorMessage = data.message;
    });
    if (file) {
      this.image = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imageShow = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
}
