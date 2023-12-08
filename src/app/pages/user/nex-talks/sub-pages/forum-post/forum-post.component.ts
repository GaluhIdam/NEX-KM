import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  faSearch,
  faMessage,
  faShareNodes,
  faTag,
  faBookOpen,
  faChevronRight,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { KeycloakService } from 'keycloak-angular';
import { SummernoteOptions } from 'ngx-summernote/lib/summernote-options';
import { Subject, takeUntil } from 'rxjs';
import { TalkCategoryDTO } from 'src/app/core/dtos/nex-talk/talk-category.dto';
import { HeaderService } from 'src/app/core/services/header/header.service';
import { ForumDataService } from 'src/app/core/services/nex-talk/forum-data.service';
import { TalkCategoryDataService } from 'src/app/core/services/nex-talk/talk-category.service';
import { SoeDTO } from 'src/app/core/soe/soe.dto';
import Swal from 'sweetalert2';
import { NotificationRequestDTO } from '../../../home-page/dtos/notification.dto';
import { SocketService } from 'src/app/core/utility/socket-io-services/socket.io.service';
import { HomePageService } from '../../../home-page/homepage.service';

@Component({
  selector: 'app-forum-post',
  templateUrl: './forum-post.component.html',
  styleUrls: ['./forum-post.component.css'],
})
export class ForumPostComponent implements OnInit, OnDestroy {
  faSearch = faSearch;
  faMessage = faMessage;
  faShareNodes = faShareNodes;
  faTag = faTag;
  faBookOpen = faBookOpen;
  faChevronRight = faChevronRight;
  faTrash = faTrash;

  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  //Stream Thumbnail File Action
  @ViewChild('forumImageFileInput', { static: false })
  forumImageFileInput!: ElementRef<HTMLInputElement>;
  selectedForumImageFile: File | null = null;
  forumImageFileDragging: Boolean = false;
  previewForumImage: string | undefined;

  //Summernote Config
  config: SummernoteOptions = {
    placeholder: 'type your content',
    tabsize: 2,
    height: 300,
    toolbar: [
      ['misc', ['codeview', 'undo', 'redo']],
      ['style', ['bold', 'italic', 'underline', 'clear']],
      ['fontsize', ['fontname', 'fontsize', 'color']],
      ['para', ['style', 'ul', 'ol', 'paragraph', 'height']],
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

  postForumForm!: FormGroup;

  talkCategoryData: TalkCategoryDTO[];

  isLoading: boolean;

  user: SoeDTO | undefined;

  personalNumber: string;

  progress: number;

  isForumImageValid: boolean;

  constructor(
    private readonly router: Router,
    private readonly formBuilder: FormBuilder,
    private readonly forumDataService: ForumDataService,
    private readonly talkCategoryDataService: TalkCategoryDataService,
    private readonly keycloakService: KeycloakService,
    private readonly headerService: HeaderService,
    private readonly webSocket: SocketService,
    private readonly homepageService: HomePageService
  ) {
    this.personalNumber = '';
    this.talkCategoryData = [];
    this.isLoading = false;
    this.progress = 0;
    this.isForumImageValid = true;
  }

  ngOnInit(): void {
    this.initializeUserOptions();
    this.getUserData(this.personalNumber);
    this.initTalkCategoryData();
    this.createPostForumForm();
  }

  ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.unsubscribe();
  }

  //GET Personal Number from Keycloak
  private initializeUserOptions(): void {
    this.personalNumber = this.keycloakService.getUsername();
  }

  //Get Personal Info from SOE
  private getUserData(personal_number: string): void {
    this.headerService.getUserData(personal_number).subscribe((response) => {
      this.user = response.body;
    });
  }

  initTalkCategoryData(): void {
    this.isLoading = true;
    this.talkCategoryDataService
      .getTalkCategoryData('page=1&limit=1000&status=true')
      .pipe(takeUntil(this._onDestroy$))
      .subscribe((response) => {
        this.isLoading = false;
        this.talkCategoryData = response.data.data;
      });
  }

  createPostForumForm(): void {
    this.postForumForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: ['', [Validators.required]],
      talk_category: [null, [Validators.required]],
      media: [null],
    });
  }

  get title() {
    return this.postForumForm.get('title');
  }

  get description() {
    return this.postForumForm.get('description');
  }

  get talk_category() {
    return this.postForumForm.get('talk_category');
  }

  get media() {
    return this.postForumForm.get('media');
  }

  onForumImageDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.forumImageFileDragging = true;
  }

  onForumImageDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.forumImageFileDragging = false;
  }

  onForumImageDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.forumImageFileDragging = false;

    const file = event.dataTransfer?.files[0];
    if (file) {
      if (this.isImageFile(file)) {
        this.readForumImageFile(file);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Wrong File',
          text: 'Please select only image file!',
        });
      }
    }
    this.postForumForm.controls['media'].markAsTouched();
  }

  onForumImageUploaded(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (file) {
      if (this.isImageFile(file)) {
        this.readForumImageFile(file);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Wrong File',
          text: 'Please select only image file!',
        });
      }
    }
    this.postForumForm.controls['media'].markAsTouched();
    fileInput.value = '';
  }

  readForumImageFile(file: File): void {
    this.selectedForumImageFile = file;
    this.checkValidationForumImageSize(file.size);
    this.postForumForm.controls['media'].setValue(file);
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      this.previewForumImage = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  onRemoveForumImage(): void {
    this.selectedForumImageFile = null;
    this.previewForumImage = '';
    this.isForumImageValid = true;
    this.postForumForm.controls['media'].setValue(null);
  }

  triggerForumImageFileInputClick(): void {
    if (this.forumImageFileInput) {
      this.forumImageFileInput.nativeElement.click();
      this.postForumForm.controls['media'].markAsTouched();
    }
  }

  isImageFile(file: File): boolean {
    const acceptedImageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    return file && acceptedImageTypes.includes(file.type);
  }

  onSubmit() {
    if (this.postForumForm.invalid) {
      return;
    }

    if (this.user) {
      const socket: NotificationRequestDTO = {
        senderPersonalNumber: this.keycloakService.getUsername(),
        receiverPersonalNumber: '782659',
        title: 'Create Forum',
        description: 'Create Forum Successfully',
        isRead: 'false',
        contentType: 'forum',
        contentUuid: 'dsd'
      };
      this.webSocket.sendSocket(socket).subscribe(),
      this.homepageService.createNotification(socket).subscribe();
      const formData = new FormData();
      formData.append('title', this.title?.value);
      formData.append('description', this.description?.value);
      formData.append('talkCategoryId', this.talk_category?.value);
      formData.append('personalNumber', this.user.personalNumber);
      formData.append('createdBy', this.user.personalName);
      formData.append('unit', this.user.personalUnit);

      if (this.media?.value !== null) {
        formData.append('media', this.media?.value);
      }

      this.isLoading = true;
      this.forumDataService.storeForumData(formData).subscribe(
        (event: any) => {
          if (event['loaded'] && event['total']) {
            this.progress = Math.round(
              (event['loaded'] / event['total']) * 100
            );
          }
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: error.error.message,
          }).then(() => {
            this.isLoading = false;
            this.progress = 0;
          });
        },
        () => {
          Swal.fire({
            icon: 'success',
            title: 'Great Move..',
            text: 'The Forum you inputed has been posted',
            timer: 2000,
          }).then(() => {
            this.isLoading = false;
            this.router.navigate(['user/nex-talks/forum']);
          });
        }
      );
    }
  }

  checkValidationForumImageSize(size: number): void {
    this.isForumImageValid = size <= 1000000; // 1 MB = 1,000,000 bytes
  }
}
