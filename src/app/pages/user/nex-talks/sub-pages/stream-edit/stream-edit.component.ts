import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { faFile, faTrash } from '@fortawesome/free-solid-svg-icons';
import { KeycloakService } from 'keycloak-angular';
import { Subject, takeUntil, tap } from 'rxjs';
import { StreamDTO } from 'src/app/core/dtos/nex-talk/stream.dto';
import { TalkCategoryDTO } from 'src/app/core/dtos/nex-talk/talk-category.dto';
import { HeaderService } from 'src/app/core/services/header/header.service';
import { StreamDataService } from 'src/app/core/services/nex-talk/stream-data.service';
import { TalkCategoryDataService } from 'src/app/core/services/nex-talk/talk-category.service';
import { SoeDTO } from 'src/app/core/soe/soe.dto';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-stream-edit',
  templateUrl: './stream-edit.component.html',
  styleUrls: ['./stream-edit.component.css'],
})
export class StreamEditComponent implements OnInit, OnDestroy {
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

  editStreamForm!: FormGroup;

  talkCategoryData: TalkCategoryDTO[];

  isLoading: boolean;
  isVideoLoading: boolean;
  isImageLoading: boolean;
  isError: boolean;

  progress: number;

  //uuid from URL
  uuid: string | null;

  //Stream Detail
  streamDetailData: StreamDTO | undefined;

  // selected Category
  selectedDefaultCategory: TalkCategoryDTO | undefined;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly formBuilder: FormBuilder,
    private readonly streamDataService: StreamDataService,
    private readonly talkCategoryDataService: TalkCategoryDataService,
    private readonly keycloakService: KeycloakService,
    private readonly headerService: HeaderService
  ) {
    this.uuid = this.route.snapshot.paramMap.get('uuid');
    this.talkCategoryData = [];
    this.isLoading = false;
    this.isError = false;
    this.isVideoLoading = false;
    this.isImageLoading = false;
    this.progress = 0;
  }

  ngOnInit(): void {
    this.createEditStreamForm();
    this.initTalkCategoryData();
  }

  ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.unsubscribe();
  }

  initTalkCategoryData(): void {
    this.isLoading = true;
    this.talkCategoryDataService
      .getTalkCategoryData('page=1&limit=1000&status=true')
      .pipe(takeUntil(this._onDestroy$))
      .subscribe((response) => {
        this.isLoading = false;
        this.talkCategoryData = response.data.data;
        this.initStreamDetailData();
      });
  }

  initStreamDetailData(): void {
    if (this.uuid) {
      this.isLoading = true;
      this.isError = false;
      this.streamDataService
        .getStreamDetailDataByUuid(this.uuid)
        .pipe(
          tap((response) => {
            response.data.pathVideo =
              environment.httpUrl +
              '/v1/api/file-manager/get-m3u8/' +
              response.data.pathVideo.replace('/transcodeMP4.m3u8', '');
            response.data.pathThumbnail =
              environment.httpUrl +
              '/v1/api/file-manager/get-imagepdf/' +
              response.data.pathThumbnail;
          }),
          takeUntil(this._onDestroy$)
        )
        .subscribe(
          (response) => {
            this.isLoading = false;
            this.streamDetailData = response.data;
            this.setDefaultValue(response.data);
          },
          () => {
            this.isLoading = false;
            this.isError = true;
          }
        );
    }
  }

  createEditStreamForm(): void {
    this.editStreamForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: ['', [Validators.required]],
      talk_category: [null, [Validators.required]],
      thumbnail: [null, [Validators.required]],
      file: [null, [Validators.required]],
    });
  }

  setDefaultValue(data: StreamDTO) {
    if (this.talkCategoryData.length > 0) {
      this.selectedDefaultCategory = this.talkCategoryData.find(
        (category) => category.id === data.talkCategoryId
      );
    }

    this.editStreamForm.patchValue({
      title: data.title,
      description: data.description,
      talk_category: this.selectedDefaultCategory?.name,
    });

    this.fetchFile(data.pathVideo, 'video');
    this.fetchFile(data.pathThumbnail, 'image');
  }

  fetchFile(url: string, type: string): void {
    this.isVideoLoading = true;
    this.isImageLoading = true;
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const fileName = url.substring(url.lastIndexOf('/') + 1);
        const fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1);
        const objectType =
          type === 'image'
            ? `image/${fileExtension}`
            : `video/${fileExtension}`;

        const file = new File([blob], fileName, { type: objectType });

        if (type === 'image') {
          this.isImageLoading = false;
          this.selectedStreamThumbnailFile = file;
          this.previewStreamThumbnailImage = url;
          this.editStreamForm.controls['thumbnail'].setValue(file);
        } else if (type === 'video') {
          this.isVideoLoading = false;
          this.selectedStreamVideoFile = file;
          this.editStreamForm.controls['file'].setValue(file);
        }
      })
      .catch(() => {
        Swal.fire({
          icon: 'error',
          title: 'Error Fetching File',
          text: 'Failed to fetch the file!',
        }).then(() => {
          if (type === 'image') {
            this.isImageLoading = false;
          } else if (type === 'video') {
            this.isVideoLoading = false;
          }
        });
      });
  }

  get title() {
    return this.editStreamForm.get('title');
  }

  get description() {
    return this.editStreamForm.get('description');
  }

  get talk_category() {
    return this.editStreamForm.get('talk_category');
  }

  get thumbnail() {
    return this.editStreamForm.get('thumbnail');
  }

  get file() {
    return this.editStreamForm.get('file');
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
    this.editStreamForm.controls['thumbnail'].markAsTouched();
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
    this.editStreamForm.controls['file'].markAsTouched();
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
    this.editStreamForm.controls['thumbnail'].markAsTouched();
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
    this.editStreamForm.controls['file'].markAsTouched();
    fileInput.value = '';
  }

  readStreamThumbnailFile(file: File): void {
    this.selectedStreamThumbnailFile = file;
    this.editStreamForm.controls['thumbnail'].setValue(file);
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      this.previewStreamThumbnailImage = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  readStreamVideoFile(file: File): void {
    this.selectedStreamVideoFile = file;
    this.editStreamForm.controls['file'].setValue(file);
  }

  onRemoveStreamThumbnail(): void {
    this.selectedStreamThumbnailFile = null;
    this.previewStreamThumbnailImage = '';
    this.editStreamForm.controls['thumbnail'].markAsTouched();
    this.editStreamForm.controls['thumbnail'].setValue(null);
  }

  onRemoveStreamVideo(): void {
    this.selectedStreamVideoFile = null;
    this.previewStreamVideo = '';
    this.editStreamForm.controls['file'].markAsTouched();
    this.editStreamForm.controls['file'].setValue(null);
  }

  triggerStreamThumbnailFileInputClick(): void {
    if (this.streamThumbnailFileInput) {
      this.streamThumbnailFileInput.nativeElement.click();
      this.editStreamForm.controls['file'].markAsTouched();
    }
  }

  triggerStreamVideoFileInputClick(): void {
    if (this.streamVideoFileInput) {
      this.streamVideoFileInput.nativeElement.click();
      this.editStreamForm.controls['file'].markAsTouched();
    }
  }

  onSubmit() {
    if (this.editStreamForm.invalid) {
      return;
    }

    if (this.streamDetailData) {
      const formData = new FormData();
      formData.append('file', this.file?.value);
      formData.append('thumbnail', this.thumbnail?.value);
      formData.append('title', this.title?.value);
      formData.append('description', this.description?.value);
      formData.append(
        'talkCategoryId',
        this.talk_category?.value.length > 1
          ? this.selectedDefaultCategory?.id
          : this.talk_category?.value
      );
      formData.append('personalNumber', this.streamDetailData.personalNumber);
      formData.append('createdBy', this.streamDetailData.createdBy);
      formData.append('unit', this.streamDetailData.unit);

      this.isLoading = true;
      this.streamDataService
        .updateStreamData(this.streamDetailData.uuid, formData)
        .subscribe(
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
          this.createEditStreamForm();
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
