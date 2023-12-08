import { Location } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { KeycloakService } from 'keycloak-angular';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { AlbumCategoryDTO } from 'src/app/core/dtos/nex-library/album-category.dto';
import { AlbumDTO } from 'src/app/core/dtos/nex-library/album.dto';
import { HeaderService } from 'src/app/core/services/header/header.service';
import { LocalService } from 'src/app/core/services/local/local.service';
import { AlbumCategoryDataService } from 'src/app/core/services/nex-library/album-category-data.service';
import { AlbumDataService } from 'src/app/core/services/nex-library/album-data.service';
import { AlbumGalleryDataService } from 'src/app/core/services/nex-library/album-gallery-data.service';
import { SoeDTO } from 'src/app/core/soe/soe.dto';
import Swal from 'sweetalert2';
import { NotificationRequestDTO } from '../../../home-page/dtos/notification.dto';
import { SocketService } from 'src/app/core/utility/socket-io-services/socket.io.service';
import { HomePageService } from '../../../home-page/homepage.service';

@Component({
  selector: 'app-publish-album',
  templateUrl: './publish-album.component.html',
  styleUrls: ['./publish-album.component.css'],
})
export class PublishAlbumComponent implements OnInit, OnDestroy {
  faTrash = faTrash;

  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  //Album Cover File Action
  @ViewChild('albumCoverFileInput', { static: false })
  albumCoverFileInput!: ElementRef<HTMLInputElement>;
  selectedAlbumCoverFile: File | null = null;
  albumCoverFileDragging: Boolean = false;
  previewAlbumCoverImage: string | undefined;

  publishAlbumForm!: FormGroup;

  //Category Popular Data
  albumCategoryData: AlbumCategoryDTO[];

  isLoading: boolean;

  user: SoeDTO | undefined;
  personalNumber: string;

  progressAlbum: number;
  progressGallery: number[];

  galeryFiles: File[] = [];
  uploadedFileSucces: boolean[];
  uploadedFileCount: number;
  addedFiles: any;

  isAlbumThumbnailValid: boolean;

  constructor(
    private readonly router: Router,
    private readonly formBuilder: FormBuilder,
    private readonly albumDataService: AlbumDataService,
    private readonly albumCategoryDataService: AlbumCategoryDataService,
    private readonly albumGalleryDataService: AlbumGalleryDataService,
    private readonly headerService: HeaderService,
    private readonly keycloakService: KeycloakService,
    private readonly toastr: ToastrService,
    private readonly localService: LocalService,
    private readonly webSocket: SocketService,
    private readonly homepageService: HomePageService
  ) {
    this.albumCategoryData = [];
    this.isLoading = false;
    this.personalNumber = '';
    this.progressAlbum = 0;
    this.progressGallery = [];
    this.uploadedFileSucces = [];
    this.uploadedFileCount = 0;
    this.isAlbumThumbnailValid = false;
  }

  ngOnInit(): void {
    this.initializeUserOptions();
    this.getUserData(this.personalNumber);
    this.createPublishAlbumForm();
    this.initAlbumCategoryData();
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

  initAlbumCategoryData(): void {
    this.isLoading = true;
    this.albumCategoryDataService
      .getAlbumCategoryData('page=1&limit=1000&is_active=true')
      .pipe(takeUntil(this._onDestroy$))
      .subscribe((response) => {
        this.isLoading = false;
        this.albumCategoryData = response.data.data;
      });
  }

  createPublishAlbumForm(): void {
    this.publishAlbumForm = this.formBuilder.nonNullable.group({
      title: ['', Validators.required],
      description: ['', [Validators.required]],
      categoryAlbum: [null, [Validators.required]],
      image: [null, [Validators.required]],
    });
  }

  get title() {
    return this.publishAlbumForm.get('title');
  }

  get description() {
    return this.publishAlbumForm.get('description');
  }

  get categoryAlbum() {
    return this.publishAlbumForm.get('categoryAlbum');
  }

  get image() {
    return this.publishAlbumForm.get('image');
  }

  onAlbumCoverDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.albumCoverFileDragging = true;
  }

  onAlbumCoverDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.albumCoverFileDragging = false;
  }

  onAlbumCoverDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.albumCoverFileDragging = false;

    const file = event.dataTransfer?.files[0];
    if (file) {
      if (this.isImageFile(file)) {
        this.readAlbumCoverFile(file);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Wrong File',
          text: 'Please select only image file!',
        });
      }
    }
    this.publishAlbumForm.controls['image'].markAsTouched();
  }

  onAlbumCoverUploaded(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (file) {
      if (this.isImageFile(file)) {
        this.readAlbumCoverFile(file);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Wrong File',
          text: 'Please select only image file!',
        });
      }
    }
    this.publishAlbumForm.controls['image'].markAsTouched();
    fileInput.value = '';
  }

  isImageFile(file: File): boolean {
    const acceptedImageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    return file && acceptedImageTypes.includes(file.type);
  }

  readAlbumCoverFile(file: File): void {
    this.selectedAlbumCoverFile = file;
    this.checkValidationPhotoThumbnailSize(file.size);
    this.publishAlbumForm.controls['image'].setValue(file);
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      this.previewAlbumCoverImage = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  onRemoveAlbumCover(): void {
    this.selectedAlbumCoverFile = null;
    this.previewAlbumCoverImage = '';
    this.publishAlbumForm.controls['image'].setValue(null);
  }

  triggerAlbumCoverFileInputClick(): void {
    if (this.albumCoverFileInput) {
      this.albumCoverFileInput.nativeElement.click();
      this.publishAlbumForm.controls['image'].markAsTouched();
    }
  }

  onSubmit() {
    if (this.user) {
      if (this.publishAlbumForm.invalid) {
        return;
      }

      if (this.galeryFiles.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'No Photo Gallery Uploaded',
          text: 'Please upload at least 1 photo gallery',
        });
      } else {
        const socket: NotificationRequestDTO = {
          senderPersonalNumber: this.keycloakService.getUsername(),
          receiverPersonalNumber: '782659',
          title: 'Create Album',
          description: 'Create Album Successfully',
          isRead: 'false',
          contentType: 'album',
          contentUuid: 'dsd'
        };
        this.webSocket.sendSocket(socket).subscribe(),
        this.homepageService.createNotification(socket).subscribe();
        const formData = new FormData();
        formData.append('image', this.image?.value);
        formData.append('title', this.title?.value);
        formData.append('description', this.description?.value);
        formData.append('categoryAlbum', this.categoryAlbum?.value);
        formData.append('personalNumber', this.personalNumber);
        formData.append('upload_by', this.user.personalName);
        formData.append('unit', this.user.personalUnit);
        this.isLoading = true;
        this.uploadedFileSucces = new Array(this.galeryFiles.length).fill(
          false
        );
        this.albumDataService.storeAlbumData(formData).subscribe(
          (event: any) => {
            //finish uploading get response
            if (event.type === 4) {
              this.onSubmitPhotoGallery(event.body.data);
              const socket: NotificationRequestDTO = {
                senderPersonalNumber: this.keycloakService.getUsername(),
                receiverPersonalNumber: '782659',
                title: 'New Album needs your approval',
                description: `Album with title ${this.title?.value} has been created and is now waiting your approval`,
                isRead: 'false',
                contentType: 'album',
                contentUuid: event.body.data.uuid,
              };
              this.webSocket
                .sendSocket(socket)
                .pipe(takeUntil(this._onDestroy$))
                .subscribe(),
                this.homepageService
                  .createNotification(socket)
                  .pipe(takeUntil(this._onDestroy$))
                  .subscribe();
            } else {
              if (event['loaded'] && event['total']) {
                this.progressAlbum = Math.round(
                  (event['loaded'] / event['total']) * 100
                );
              }
            }
          },
          (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: error.error.message,
            }).then(() => {
              this.isLoading = false;
              this.progressAlbum = 0;
            });
          }
        );
      }
    }
  }

  onSubmitPhotoGallery(album: AlbumDTO): void {
    if (this.galeryFiles.length <= 10) {
      this.isLoading = true;

      this.galeryFiles.map((file, index) => {
        if (this.user) {
          const formData = new FormData();
          formData.append('id_album', String(album.id));
          formData.append('name', album.title);
          formData.append('personalNumber', this.user.personalNumber);
          formData.append('images', file);

          this.albumGalleryDataService
            .storeAlbumGalleryData(formData)
            .subscribe(
              (event: any) => {
                if (event['loaded'] && event['total']) {
                  this.progressGallery[index] = Math.round(
                    (event['loaded'] / event['total']) * 100
                  );
                }
              },
              (error) => {
                this.uploadedFileCount += 1;
                this.toastr.error(
                  error.error.message,
                  `Upload ${this.galeryFiles[index].name} Failed`
                );
                this.onCheckUploadedPhotoGallery();
              },
              () => {
                this.uploadedFileSucces[index] = true;
                this.uploadedFileCount += 1;

                this.onCheckUploadedPhotoGallery();
              }
            );
        }
      });
    }
  }

  onCheckUploadedPhotoGallery(): void {
    if (this.uploadedFileCount === this.galeryFiles.length) {
      const allUploadSuccess = this.uploadedFileSucces.every(
        (item) => item === true
      );

      // Success upload all photos
      if (allUploadSuccess) {
        Swal.fire({
          icon: 'success',
          title: 'Great Move..',
          text: 'The album you inputed has been submitted and now is waiting approval',
        }).then(() => {
          this.isLoading = false;
          this.progressAlbum = 0;
          this.router.navigate(['/user/nex-library/album']);
        });
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Great Move..',
          text: 'The album you inputted has been submitted, but there are some galleries that failed to upload',
        }).then(() => {
          this.isLoading = false;
          this.progressAlbum = 0;
          this.onPreviousPage();
        });
      }
    }
  }

  onPreviousPage() {
    const backRouting = this.localService.getData(
      'url_back_from_publish_album'
    );

    if (backRouting !== null) {
      this.router.navigate([backRouting]);
    } else {
      this.router.navigate(['/user/nex-library/album']);
    }
  }

  onSelectGalery(event: { addedFiles: any }) {
    if (this.galeryFiles.length < 10) {
      this.galeryFiles.push(...event.addedFiles);
      this.progressGallery.push(0);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Limit reached',
        text: 'Up to 10 photos can be uploaded',
      });
    }
  }
  onRemoveGalery(event: File) {
    this.galeryFiles.splice(this.galeryFiles.indexOf(event), 1);
    this.progressGallery.splice(this.galeryFiles.indexOf(event), 1);
  }

  checkValidationPhotoThumbnailSize(size: number): void {
    this.isAlbumThumbnailValid = size <= 1000000; // 1 MB = 1,000,000 bytes
  }
}
