import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
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
import { PlyrComponent } from 'ngx-plyr';
import Swal from 'sweetalert2';
import { StoryPublishDTO } from 'src/app/pages/user/nex-learning/dtos/story.dto';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-story-edit',
  templateUrl: './story-edit.component.html',
  styleUrls: ['./story-edit.component.css'],
})
export class StoryEditComponent
  extends BaseController
  implements OnInit, OnDestroy {
  constructor(
    private readonly activeRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly nexLearningService: NexLearningService,
    private readonly keycloakService: KeycloakService
  ) {
    super(StoryEditComponent.name);
  }

  videoShow!: string;
  faSearch = faSearch;
  faArrowRight = faArrowRight;
  faBookBookmark = faBookBookmark;
  faBookOpen = faBookOpen;
  faCheckCircle = faCheckCircle;
  faXmark = faXmark;
  faQuestion = faQuestion;
  faComment = faCommentDots;

  loading: boolean = true;

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
  categoryStoryList: Array<string> = ['Inspirational', 'Retirement'];
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

  uuid!: string;

  title!: string;
  category!: number;
  video!: File;
  image!: File;
  dateCreated!: Date;
  createdBy!: string;
  unit!: string;
  editorChoice!: boolean;
  favorite!: boolean;
  statusApprove!: boolean;
  approvalBy!: number;
  description!: string;

  imageValidator!: boolean;
  imageValidatorMessage!: string;
  imageShow: string = 'https://puprpkpp.riau.go.id/asset/img/default-image.png';

  videoSources: any[] = [];

  //Video Validation
  videoValidator: boolean = true;
  videoValidatorMessage!: string;

  mform: FormGroup = new FormGroup({
    image: new FormControl(''),
    title: new FormControl(this.title, [Validators.required]),
    category: new FormControl(this.category, [Validators.required]),
    video: new FormControl(this.video),
    dateCreated: new FormControl(this.dateCreated, [Validators.required]),
    createdBy: new FormControl(this.createdBy, [Validators.required]),
    unit: new FormControl(this.unit, [Validators.required]),
    editorChoice: new FormControl(this.statusEditorChoice[0].status, [
      Validators.required,
    ]),
    favorite: new FormControl(this.favoriteList[0].status, [
      Validators.required,
    ]),
    statusApprove: new FormControl(this.statusApproveList[0].status),
    approvalBy: new FormControl(this.approvalBy, [Validators.required]),
    description: new FormControl(this.description, [Validators.required]),
  });

  //Summernote Config
  config: SummernoteOptions = {
    placeholder: 'type your content',
    tabsize: 2,
    height: 500,
    uploadImagePath: '/api/upload',
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

  ngOnInit(): void {
    this.activeRoute.params.subscribe((params: Params) => {
      const uuid = params['uuid'];
      this.uuid = uuid;
      this.getById(uuid);
    });
  }

  ngOnDestroy(): void {
    // throw new Error('Method not implemented.');
  }

  onFileSelected(event: any): void {
    this.video = event.target.files[0];
    this.videoValidation(this.video, 200).then((data) => {
      this.videoValidator = data.status;
      this.videoValidatorMessage = data.message;
      const videoURL = URL.createObjectURL(this.video);
      this.videoShow = videoURL;
    });
  }

  cancel(): void {
    this.router.navigate(['/user/nex-learning/inspirational-story']);
  }

  async getById(uuid: string): Promise<void> {
    try {
      this.nexLearningService.getStoryById(uuid).subscribe((response) => {
        this.mform.get('title')?.setValue(response.data.title);
        this.mform.get('category')?.setValue(response.data.category);
        this.mform.get('createdBy')?.setValue(response.data.uploadBy);
        this.mform.get('unit')?.setValue(response.data.unit);
        this.mform.get('description')?.setValue(response.data.description);
        this.mform.get('approvalBy')?.setValue(response.data.approvalBy);
        this.mform.get('statusApprove')?.setValue(response.data.approvalStatus);
        this.mform.get('editorChoice')?.setValue(response.data.editorChoice);
        const date = new Date(response.data.createdAt);
        this.mform.get('dateCreated')?.setValue(this.formatDateNow(date));

        this.imageShow =
          environment.httpUrl +
          '/v1/api/file-manager/get-imagepdf/' +
          response.data.cover;
        this.nexLearningService
          .getImageFromUrl(this.imageShow)
          .subscribe((file) => {
            this.image = file;
            this.loading = false;
          });
        this.videoShow =
          environment.httpUrl +
          '/v1/api/file-manager/get-imagepdf/' +
          response.data.path;

        this.nexLearningService
          .getVideoFromUrl(this.videoShow)
          .subscribe((file) => {
            this.video = file;
            this.loading = false;
          });

        this.mform.get('createdBy')?.disable();
        this.mform.get('unit')?.disable();
        this.mform.get('dateCreated')?.disable();
        this.mform.get('approvalBy')?.disable();
        this.mform.get('statusApprove')?.disable();
        this.mform.get('favorite')?.disable();
        this.mform.get('editorChoice')?.disable();
      });
    } catch (error) {
      throw error;
    }
  }

  //Update Story
  async postStory(uuid: string): Promise<void> {
    try {
      if (
        this.mform.valid &&
        (this.videoValidator == null || this.videoValidator == true)
      ) {
        this.nexLearningService
          .getUser(this.keycloakService.getUsername())
          .subscribe(async (data) => {
            const dto: StoryPublishDTO = {
              category: this.mform.get('category')?.value,
              title: this.mform.get('title')?.value,
              description: this.mform.get('description')?.value,
              personalNumber: this.keycloakService.getUsername(),
              unit: data.personalUnit,
              fileVideo: this.video,
              uploadBy: data.personalName,
              status: false,
              cover: this.image
            };
            this.nexLearningService
              .updateStory(uuid, dto)
              .pipe()
              .subscribe(
                (event: any) => {
                  if (event['loaded'] && event['total']) {
                    this.progress = Math.round(
                      (event['loaded'] / event['total']) * 100
                    );
                  }
                },
                (error) => {
                  throw error;
                },
                () => {
                  Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Your story was successfully created.',
                    timer: 1000,
                    showConfirmButton: false,
                  }).then(() => {
                    if (this.mform.get('category')?.value == 'Inspirational') {
                      this.router.navigate(['/admin/inspirational-story']);
                    } else {
                      this.router.navigate(['/admin/retirement-story']);
                    }
                  });
                }
              );
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

  onFileSelectedCover(event: any) {
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

  //Media Player
  @ViewChild(PlyrComponent, { static: true })
  plyr!: PlyrComponent;

  player!: Plyr;

  played(event: Plyr.PlyrEvent) {
  }

  play(): void {
    this.player.play();
  }

  pause(): void {
    this.player.pause();
  }

  stop(): void {
    this.player.stop();
  }
}
