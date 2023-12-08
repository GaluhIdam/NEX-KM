import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { faFile, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Subject, takeUntil } from 'rxjs';
import { TalkCategoryDTO } from 'src/app/core/dtos/nex-talk/talk-category.dto';
import { StreamDataService } from 'src/app/core/services/nex-talk/stream-data.service';
import { TalkCategoryDataService } from 'src/app/core/services/nex-talk/talk-category.service';
import Swal from 'sweetalert2';
import { KeycloakService } from 'keycloak-angular';
import { HeaderService } from 'src/app/core/services/header/header.service';
import { SoeDTO } from 'src/app/core/soe/soe.dto';
import { SocketService } from 'src/app/core/utility/socket-io-services/socket.io.service';
import { HomePageService } from '../../../home-page/homepage.service';
import { NotificationRequestDTO } from '../../../home-page/dtos/notification.dto';

@Component({
  selector: 'app-stream-publish',
  templateUrl: './stream-publish.component.html',
  styleUrls: ['./stream-publish.component.css'],
})
export class StreamPublishComponent implements OnInit, OnDestroy {
  faTrash = faTrash;
  faFile = faFile;

  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  //Stream File Action
  @ViewChild('streamVideoFileInput', { static: false })
  streamVideoFileInput!: ElementRef<HTMLInputElement>;
  selectedStreamVideoFile: File | null = null;
  streamVideoFileDragging: Boolean = false;
  previewStreamVideo: string | undefined;

  //Stream Thumbnail File Action
  @ViewChild('streamThumbnailFileInput', { static: false })
  streamThumbnailFileInput!: ElementRef<HTMLInputElement>;
  selectedStreamThumbnailFile: File | null = null;
  streamThumbnailFileDragging: Boolean = false;
  previewStreamThumbnailImage: string | undefined;

  publishStreamForm!: FormGroup;

  talkCategoryData: TalkCategoryDTO[];

  isLoading: boolean;

  user: SoeDTO | undefined;

  personalNumber: string;

  progress: number;

  constructor(
    private readonly router: Router,
    private readonly formBuilder: FormBuilder,
    private readonly streamDataService: StreamDataService,
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
  }

  ngOnInit(): void {
    this.initializeUserOptions();
    this.getUserData(this.personalNumber);
    this.createPublishStreamForm();
    this.initTalkCategoryData();
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

  createPublishStreamForm(): void {
    this.publishStreamForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: ['', [Validators.required]],
      talk_category: [null, [Validators.required]],
      thumbnail: [null, [Validators.required]],
      file: [null, [Validators.required]],
    });
  }

  get title() {
    return this.publishStreamForm.get('title');
  }

  get description() {
    return this.publishStreamForm.get('description');
  }

  get talk_category() {
    return this.publishStreamForm.get('talk_category');
  }

  get thumbnail() {
    return this.publishStreamForm.get('thumbnail');
  }

  get file() {
    return this.publishStreamForm.get('file');
  }

  onStreamThumbnailDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.streamThumbnailFileDragging = true;
  }

  onStreamVideoDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.streamVideoFileDragging = true;
  }

  onStreamThumbnailDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.streamThumbnailFileDragging = false;
  }

  onStreamVideoDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.streamVideoFileDragging = false;
  }

  onStreamThumbnailDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.streamThumbnailFileDragging = false;

    const file = event.dataTransfer?.files[0];
    if (file) {
      if (this.isImageFile(file)) {
        this.readStreamThumbnailFile(file);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Wrong File',
          text: 'Please select only image file!',
        });
      }
    }
    this.publishStreamForm.controls['thumbnail'].markAsTouched();
  }

  onStreamVideoDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.streamVideoFileDragging = false;

    const file = event.dataTransfer?.files[0];
    if (file) {
      if (this.isVideoFile(file)) {
        this.readStreamVideoFile(file);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Wrong File',
          text: 'Please select only MP4 file!',
        });
      }
    }
    this.publishStreamForm.controls['file'].markAsTouched();
  }

  onStreamThumbnailUploaded(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (file) {
      if (this.isImageFile(file)) {
        this.readStreamThumbnailFile(file);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Wrong File',
          text: 'Please select only image file!',
        });
      }
    }
    this.publishStreamForm.controls['thumbnail'].markAsTouched();
    fileInput.value = '';
  }

  onStreamVideoUploaded(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (file) {
      if (this.isVideoFile(file)) {
        this.readStreamVideoFile(file);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Wrong File',
          text: 'Please select only MP4 file!',
        });
      }
    }
    this.publishStreamForm.controls['file'].markAsTouched();
    fileInput.value = '';
  }

  readStreamThumbnailFile(file: File): void {
    this.selectedStreamThumbnailFile = file;
    this.publishStreamForm.controls['thumbnail'].setValue(file);
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      this.previewStreamThumbnailImage = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  readStreamVideoFile(file: File): void {
    this.selectedStreamVideoFile = file;
    this.publishStreamForm.controls['file'].setValue(file);
  }

  onRemoveStreamThumbnail(): void {
    this.selectedStreamThumbnailFile = null;
    this.previewStreamThumbnailImage = '';
    this.publishStreamForm.controls['thumbnail'].setValue(null);
  }

  onRemoveStreamVideo(): void {
    this.selectedStreamVideoFile = null;
    this.previewStreamVideo = '';
    this.publishStreamForm.controls['file'].setValue(null);
  }

  triggerStreamThumbnailFileInputClick(): void {
    if (this.streamThumbnailFileInput) {
      this.streamThumbnailFileInput.nativeElement.click();
      this.publishStreamForm.controls['file'].markAsTouched();
    }
  }

  triggerStreamVideoFileInputClick(): void {
    if (this.streamVideoFileInput) {
      this.streamVideoFileInput.nativeElement.click();
      this.publishStreamForm.controls['file'].markAsTouched();
    }
  }

  onSubmit() {
    if (this.publishStreamForm.invalid) {
      return;
    }

    if (this.user) {
      const socket: NotificationRequestDTO = {
        senderPersonalNumber: this.keycloakService.getUsername(),
        receiverPersonalNumber: '782659',
        title: 'Create Stream',
        description: 'Create Stream Successfully',
        isRead: 'false',
        contentType: 'stream',
        contentUuid: 'nice'
      };
      this.webSocket.sendSocket(socket).subscribe(),
      this.homepageService.createNotification(socket).subscribe();
      const formData = new FormData();
      formData.append('file', this.file?.value);
      formData.append('thumbnail', this.thumbnail?.value);
      formData.append('title', this.title?.value);
      formData.append('description', this.description?.value);
      formData.append('talkCategoryId', this.talk_category?.value);
      formData.append('personalNumber', this.user.personalNumber);
      formData.append('createdBy', this.user.personalName);
      formData.append('unit', this.user.personalUnit);

      this.isLoading = true;
      this.streamDataService.storeStreamData(formData).subscribe(
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
          });
          this.isLoading = false;
        },
        () => {
          Swal.fire({
            icon: 'success',
            title: 'Great Move..',
            text: 'The Stream you inputed has been published',
            timer: 2000,
          }).then(() => {
            this.isLoading = false;
            this.router.navigate(['user/nex-talks/stream/list']);
          });
        }
      );
    }
  }

  isImageFile(file: File): boolean {
    const acceptedImageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    return file && acceptedImageTypes.includes(file.type);
  }

  isVideoFile(file: File): boolean {
    const acceptedPDFTypes = ['video/mp4'];
    return file && acceptedPDFTypes.includes(file.type);
  }

  onPreviousPage() {
    if (
      this.title?.value ||
      this.thumbnail?.value ||
      this.file?.value ||
      this.description?.value ||
      this.talk_category?.value
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Do you want to leave?',
        text: 'Are you sure want to leave? your changes will lost',
        confirmButtonText: 'Yes',
        showCancelButton: true,
        cancelButtonText: 'No',
      }).then((result) => {
        if (result.isConfirmed) {
          this.createPublishStreamForm();
          Swal.fire({
            title: 'Your Changes are not saved',
            icon: 'info',
            showConfirmButton: false,
            timer: 2000,
          }).then(() => {
            this.router.navigate(['user/nex-talks/stream/list']);
          });
        }
      });
    } else {
      this.router.navigate(['user/nex-talks/stream/list']);
    }
  }

  formatFileSize(size: number): string {
    if (size === 0) {
      return '0 B';
    }

    const units = ['B', 'KB', 'MB', 'GB'];
    const base = 1000;
    const exponent = Math.floor(Math.log(size) / Math.log(base));
    const formattedSize = (size / Math.pow(base, exponent)).toFixed(2);

    return `${formattedSize} ${units[exponent]}`;
  }
}
