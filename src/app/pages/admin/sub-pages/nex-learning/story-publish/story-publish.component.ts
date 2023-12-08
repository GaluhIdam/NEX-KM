import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import { KeycloakService } from 'keycloak-angular';
import { Router } from '@angular/router';
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
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, initTE } from 'tw-elements';
import { SummernoteOptions } from 'ngx-summernote/lib/summernote-options';
import { PlyrComponent } from 'ngx-plyr';
import Swal from 'sweetalert2';
import { NexLearningService } from 'src/app/pages/user/nex-learning/nex-learning.service';
import { StoryPublishDTO } from 'src/app/pages/user/nex-learning/dtos/story.dto';
import { StatusDTO } from 'src/app/pages/user/nex-learning/dtos/status.dto';
import { catchError, of, switchMap, tap, throwError } from 'rxjs';
import { HttpEvent, HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-story-publish',
  templateUrl: './story-publish.component.html',
  styleUrls: ['./story-publish.component.css'],
})
export class StoryPublishComponent
  extends BaseController
  implements OnInit, OnDestroy {
  constructor(
    private readonly router: Router,
    private readonly nexLearningService: NexLearningService,
    private readonly keycloakService: KeycloakService
  ) {
    super(StoryPublishComponent.name);
  }

  faSearch = faSearch;
  faArrowRight = faArrowRight;
  faBookBookmark = faBookBookmark;
  faBookOpen = faBookOpen;
  faCheckCircle = faCheckCircle;
  faXmark = faXmark;
  faQuestion = faQuestion;
  faComment = faCommentDots;

  loading: boolean = true;

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

  //Image Validation
  imageValidator!: boolean;
  imageValidatorMessage!: string;
  imageShow: string = 'https://puprpkpp.riau.go.id/asset/img/default-image.png';

  videoSources: any[] = [];

  mform: FormGroup = new FormGroup({
    title: new FormControl(this.title, [Validators.required]),
    category: new FormControl(this.category, [Validators.required]),
    video: new FormControl(this.video, [Validators.required]),
    image: new FormControl(this.image, [Validators.required]),
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

  ngOnDestroy(): void { }

  ngAfterContentChecked(): void {
    initTE({ Select });
  }

  ngOnInit(): void {
    this.getUserData();
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

  private getEventMessage(event: HttpEvent<any>) {
    switch (event.type) {
      case HttpEventType.Sent:
        return `Uploading file.`;

      case HttpEventType.UploadProgress:
        // Compute and show the % done:
        const percentDone = event.total
          ? Math.round((100 * event.loaded) / event.total)
          : 0;
        if (event.loaded && event.total) {
          this.progress = Math.round((event['loaded'] / event['total']) * 100);
        }
        return `File is ${percentDone}% uploaded.`;

      case HttpEventType.Response:
        return `File was completely uploaded!`;

      default:
        return `File surprising upload event: ${event.type}.`;
    }
  }

  //Create Story
  async postStory(): Promise<void> {
    try {
      if (this.mform.valid) {
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
              cover: this.image,
            };
            this.nexLearningService
              .createStory(dto)
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

  onFileSelected(event: any): void {
    this.video = event.target.files[0];
    const videoURL = URL.createObjectURL(this.video);

    // Create the video source object
    const videoSource = {
      src: videoURL,
      type: 'video/mp4',
      size: 576,
      provider: 'html5',
    };

    // Update the video sources array
    this.videoSources = [videoSource];
  }

  cancel(): void {
    this.router.navigate(['/user/nex-learning/inspirational-story']);
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
