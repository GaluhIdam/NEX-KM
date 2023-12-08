import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
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
import { BestPracticePublishDTO } from 'src/app/pages/user/nex-learning/dtos/best-practice.dto';
import Swal from 'sweetalert2';
import { Select, initTE } from 'tw-elements';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-best-practice-edit',
  templateUrl: './best-practice-edit.component.html',
  styleUrls: ['./best-practice-edit.component.css'],
})
export class BestPracticeEditComponent
  extends BaseController
  implements OnInit, OnDestroy
{
  constructor(
    private readonly router: Router,
    private readonly activeRoute: ActivatedRoute,
    private readonly nexLearningService: NexLearningService,
    private readonly keycloakService: KeycloakService
  ) {
    super(BestPracticeEditComponent.name);
  }
  ngOnInit(): void {
    initTE({ Select });
    this.activeRoute.params.subscribe((params: Params) => {
      this.uuid = params['uuid'];
      this.getBestPracticeData(this.uuid);
    });
  }
  ngOnDestroy(): void {}

  faSearch = faSearch;
  faArrowRight = faArrowRight;
  faBookBookmark = faBookBookmark;
  faBookOpen = faBookOpen;
  faCheckCircle = faCheckCircle;
  faXmark = faXmark;
  faQuestion = faQuestion;
  faComment = faCommentDots;

  imageShow!: string;
  uuid!: string;
  loading: boolean = true;

  image!: File;
  //Image Validation
  imageValidator: boolean = true;
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

  mform: FormGroup = new FormGroup({
    title: new FormControl('', [Validators.required]),
    image: new FormControl(''),
    unit: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    dateCreated: new FormControl('', [Validators.required]),
    createdBy: new FormControl('', [Validators.required]),
    editorChoice: new FormControl(this.statusEditorChoice[0].status),
    favorite: new FormControl(this.favoriteList[0].status),
    statusApprove: new FormControl(this.statusApproveList[0].status),
    approvalBy: new FormControl(''),
    personalNumber: new FormControl(''),
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

  async getBestPracticeData(uuid: string): Promise<void> {
    this.nexLearningService.getBestPracticeByUuid(uuid).subscribe((data) => {
      this.mform.get('title')?.setValue(data.data.title);
      this.mform.get('unit')?.setValue(data.data.unit);
      this.mform.get('description')?.setValue(data.data.content);
      this.mform.get('createdBy')?.setValue(data.data.uploadBy);
      this.mform.get('statusApprove')?.setValue(data.data.approvalStatus);
      this.mform.get('approvalBy')?.setValue(data.data.approvalBy);
      this.mform.get('editorChoice')?.setValue(data.data.editorChoice);
      this.mform.get('personalNumber')?.setValue(data.data.personalNumber);
      this.mform
        .get('dateCreated')
        ?.setValue(data.data.createdAt?.toString().slice(0, 10));
      this.imageShow =
        environment.httpUrl +
        '/v1/api/file-manager/get-imagepdf/' +
        data.data.path;
      this.nexLearningService
        .getImageFromUrl(this.imageShow)
        .subscribe((file) => {
          this.image = file;
          this.loading = false;
        });

      this.mform.get('editorChoice')?.disable();
      this.mform.get('statusApprove')?.disable();
      this.mform.get('favorite')?.disable();
      this.mform.get('unit')?.disable();
      this.mform.get('createdBy')?.disable();
      this.mform.get('dateCreated')?.disable();
      this.mform.get('approvalBy')?.disable();
    });
  }

  async postBestPractice(uuid: string): Promise<void> {
    try {
      if (
        this.mform.valid &&
        (this.imageValidator == null || this.imageValidator == true)
      ) {
        this.nexLearningService
          .getUser(this.keycloakService.getUsername())
          .subscribe((response) => {
            const dto: BestPracticePublishDTO = {
              personalNumber: this.mform.get('personalNumber')?.value,
              title: this.mform.get('title')?.value,
              content: this.mform.get('description')?.value,
              image: this.image,
              uploadBy: response.personalName,
              unit: this.mform.get('unit')?.value,
            };
            this.nexLearningService
              .updateBestPractice(uuid, dto)
              .subscribe(() => {
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

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
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
