import { Location } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil, tap } from 'rxjs';
import { AlbumCategoryDTO } from 'src/app/core/dtos/nex-library/album-category.dto';
import { AlbumGalleryDTO } from 'src/app/core/dtos/nex-library/album-gallery.dto';
import { AlbumDTO } from 'src/app/core/dtos/nex-library/album.dto';
import { HeaderService } from 'src/app/core/services/header/header.service';
import { AlbumCategoryDataService } from 'src/app/core/services/nex-library/album-category-data.service';
import { AlbumDataService } from 'src/app/core/services/nex-library/album-data.service';
import { AlbumGalleryDataService } from 'src/app/core/services/nex-library/album-gallery-data.service';
import { SoeDTO } from 'src/app/core/soe/soe.dto';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-album',
  templateUrl: './edit-album.component.html',
  styleUrls: ['./edit-album.component.css'],
})
export class EditAlbumComponent implements OnInit, OnDestroy {
  faTrash = faTrash;

  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  //Album Cover File Action
  @ViewChild('albumCoverFileInput', { static: false })
  albumCoverFileInput!: ElementRef<HTMLInputElement>;
  selectedAlbumCoverFile: File | null = null;
  albumCoverFileDragging: Boolean = false;
  previewAlbumCoverImage: string | undefined;

  editAlbumForm!: FormGroup;

  //Category Popular Data
  albumCategoryData: AlbumCategoryDTO[];

  //uuid from URL
  uuid: string | null;

  //eBook Detail
  albumDetailData: AlbumDTO | undefined;

  // selected Category
  selectedDefaultCategory: AlbumCategoryDTO | undefined;

  isLoading: boolean;
  isImageLoading: boolean;
  isDeleteGalleryLoading: boolean;

  progressAlbum: number;
  progressGallery: number[];

  albumGalleryData: AlbumGalleryDTO[];

  galeryFiles: {
    uuid: string;
    file: File;
  }[] = [];
  uploadedFileSucces: boolean[];
  uploadedFileCount: number;

  user: SoeDTO | undefined;

  isAlbumThumbnailValid: boolean;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly formBuilder: FormBuilder,
    private readonly albumDataService: AlbumDataService,
    private readonly albumCategoryDataService: AlbumCategoryDataService,
    private readonly albumGalleryDataService: AlbumGalleryDataService,
    private readonly headerService: HeaderService,
    private readonly toastr: ToastrService
  ) {
    this.uuid = this.route.snapshot.paramMap.get('uuid');
    this.albumCategoryData = [];
    this.isLoading = false;
    this.isImageLoading = false;
    this.progressAlbum = 0;
    this.progressGallery = [];
    this.uploadedFileSucces = [];
    this.uploadedFileCount = 0;
    this.albumGalleryData = [];
    this.isDeleteGalleryLoading = false;
    this.isAlbumThumbnailValid = false;
  }

  ngOnInit(): void {
    this.createEditAlbumForm();
    this.initAlbumCategoryData();
  }
  ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.unsubscribe();
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
        this.initAlbumDetailData();
      });
  }

  initAlbumDetailData(): void {
    if (this.uuid) {
      this.isLoading = true;
      this.albumDataService
        .getAlbumDetailDataByUuid(this.uuid)
        .pipe(
          tap((response) => {
            response.data.path =
              environment.httpUrl +
              '/v1/api/file-manager/get-imagepdf/' +
              response.data.path;
          }),
          takeUntil(this._onDestroy$)
        )
        .subscribe((response) => {
          this.isLoading = false;
          this.albumDetailData = response.data;
          this.setDefaultValueAlbum(response.data);
          this.getUserData(response.data.personalNumber);
          this.initPhotoGalleries(response.data.id, true);
        });
    }
  }

  initPhotoGalleries(albumId: number, refresh?: boolean): void {
    if (refresh) {
      this.isLoading = true;
    }
    this.albumGalleryDataService
      .getAlbumGalleryDataPaginateByAlbumId(
        albumId,
        'page=1&limit=1000&is_active=true'
      )
      .pipe(
        tap((response) => {
          response.data.data.map((dt) => {
            dt.path =
              environment.httpUrl +
              '/v1/api/file-manager/get-imagepdf/' +
              dt.path;
          });
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe((response) => {
        if (refresh) {
          this.isLoading = false;
        }
        this.progressGallery = new Array(response.data.data.length).fill(0);
        this.albumGalleryData = response.data.data;
        this.albumGalleryData.map((gallery) => {
          this.fetchFile(gallery.path, 'gallery', gallery.uuid);
        });
      });
  }

  createEditAlbumForm(): void {
    this.editAlbumForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: ['', [Validators.required]],
      categoryAlbum: [null, [Validators.required]],
      image: [null, [Validators.required]],
    });
  }

  get title() {
    return this.editAlbumForm.get('title');
  }

  get description() {
    return this.editAlbumForm.get('description');
  }

  get categoryAlbum() {
    return this.editAlbumForm.get('categoryAlbum');
  }

  get image() {
    return this.editAlbumForm.get('image');
  }

  setDefaultValueAlbum(data: AlbumDTO) {
    if (this.albumCategoryData.length > 0) {
      this.selectedDefaultCategory = this.albumCategoryData.find(
        (category) => category.id === data.categoryAlbumId
      );
    }

    this.editAlbumForm.patchValue({
      title: data.title,
      description: data.description,
      categoryAlbum: this.selectedDefaultCategory?.name,
    });

    this.fetchFile(data.path, 'album');
  }

  fetchFile(url: string, type: string, galleryUuid?: string): void {
    this.isImageLoading = true;
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const fileName = url.substring(url.lastIndexOf('/') + 1);
        const fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1);

        const file = new File([blob], fileName, {
          type: `image/${fileExtension}`,
        });

        this.isImageLoading = false;
        if (type === 'album') {
          this.selectedAlbumCoverFile = file;
          this.checkValidationPhotoThumbnailSize(file.size);
          this.previewAlbumCoverImage = url;
          this.editAlbumForm.controls['image'].setValue(file);
        } else if (type === 'gallery') {
          if (galleryUuid !== undefined) {
            this.galeryFiles.push({
              uuid: galleryUuid,
              file,
            });
          }
        }
      })
      .catch(() => {
        this.isImageLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error Fetching File',
          text: 'Failed to fetch the file!',
        });
      });
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
    this.editAlbumForm.controls['image'].markAsTouched();
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
    this.editAlbumForm.controls['image'].markAsTouched();
    fileInput.value = '';
  }

  isImageFile(file: File): boolean {
    const acceptedImageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    return file && acceptedImageTypes.includes(file.type);
  }

  readAlbumCoverFile(file: File): void {
    this.selectedAlbumCoverFile = file;
    this.checkValidationPhotoThumbnailSize(file.size);
    this.editAlbumForm.controls['image'].setValue(file);
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      this.previewAlbumCoverImage = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  onRemoveAlbumCover(): void {
    this.selectedAlbumCoverFile = null;
    this.previewAlbumCoverImage = '';
    this.editAlbumForm.controls['image'].setValue(null);
  }

  triggerAlbumCoverFileInputClick(): void {
    if (this.albumCoverFileInput) {
      this.albumCoverFileInput.nativeElement.click();
      this.editAlbumForm.controls['image'].markAsTouched();
    }
  }

  onSubmit(): void {
    if (this.user) {
      if (this.editAlbumForm.invalid) {
        return;
      }

      if (this.galeryFiles.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'No Photo Gallery Uploaded',
          text: 'Please upload at least 1 photo gallery',
        });
      } else {
        const formData = new FormData();
        formData.append('image', this.image?.value);
        formData.append('title', this.title?.value);
        formData.append('description', this.description?.value);
        formData.append(
          'categoryAlbum',
          this.categoryAlbum?.value.length > 1
            ? this.selectedDefaultCategory?.id
            : this.categoryAlbum?.value
        );
        formData.append('personalNumber', this.user.personalNumber);
        formData.append('upload_by', this.user.personalName);
        formData.append('unit', this.user.personalUnit);

        this.isLoading = true;
        this.uploadedFileSucces = new Array(this.galeryFiles.length).fill(
          false
        );
        this.progressGallery = new Array(this.galeryFiles.length).fill(0);
        if (this.uuid) {
          this.albumDataService.updateAlbumData(this.uuid, formData).subscribe(
            (event: any) => {
              //finish uploading get response
              if (event.type === 4) {
                this.onSubmitPhotoGallery(event.body.data);
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
  }

  onSubmitPhotoGallery(album: AlbumDTO): void {
    if (this.galeryFiles.length <= 10) {
      this.isLoading = true;

      this.galeryFiles.map((file, index) => {
        if (this.user && file.uuid !== '-') {
          this.uploadedFileCount += 1;
          this.uploadedFileSucces[index] = true;
          this.progressGallery[index] = 100;
          Swal.fire({
            icon: 'success',
            title: 'Great Move..',
            text: 'The Album you inputed has been edited',
          }).then(() => {
            this.isLoading = false;
            this.progressAlbum = 0;
            this.onPreviousPage();
          });
        }
        if (this.user && file.uuid === '-') {
          const formData = new FormData();
          formData.append('id_album', String(album.id));
          formData.append('name', album.title);
          formData.append('personalNumber', this.user.personalNumber);
          formData.append('images', file.file);

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
                  `Upload ${this.galeryFiles[index].file.name} Failed`
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
          text: 'The Album you inputed has been edited',
        }).then(() => {
          this.isLoading = false;
          this.progressAlbum = 0;
          this.onPreviousPage();
        });
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Great Move..',
          text: 'The album you inputted has been edited, but there are some galleries that failed to upload',
        }).then(() => {
          this.isLoading = false;
          this.progressAlbum = 0;
          this.onPreviousPage();
        });
      }
    }
  }

  onPreviousPage() {
    this.router.navigate(['/user/nex-library/my-album']);
  }

  onSelectGalery(event: { addedFiles: any }) {
    if (this.galeryFiles.length <= 10) {
      this.galeryFiles.push({ uuid: '-', file: event.addedFiles[0] });
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
    const selectedGallery = this.galeryFiles.find(
      (item) => item.file === event
    );

    if (selectedGallery) {
      if (selectedGallery.uuid !== '-') {
        this.onDeleteSelectedAlbumGallery(selectedGallery.uuid, event);
      } else {
        const removeIndex = this.galeryFiles.findIndex(
          (item) => item.file === event
        );

        if (removeIndex !== -1) {
          this.galeryFiles.splice(removeIndex, 1);
          this.progressGallery.splice(removeIndex, 1);
        }
      }
    }
  }

  onDeleteSelectedAlbumGallery(uuid: string, selectedFile: File): void {
    this.isDeleteGalleryLoading = true;
    const requestBody = {
      uuid: [uuid],
    };

    this.albumGalleryDataService.deleteAlbumGalleryData(requestBody).subscribe(
      () => {
        this.isDeleteGalleryLoading = false;
        this.toastr.success(
          'The photo gallery you selected has been deleted',
          'Delete Photo Gallery Success'
        );
        const removeIndex = this.galeryFiles.findIndex(
          (item) => item.file === selectedFile
        );

        if (removeIndex !== -1) {
          this.galeryFiles.splice(removeIndex, 1);
          this.progressGallery.splice(removeIndex, 1);
        }
      },
      (error) => {
        this.isDeleteGalleryLoading = false;
        this.toastr.error(error.error.message, 'Delete Photo Gallery Failed');
      }
    );
  }

  checkValidationPhotoThumbnailSize(size: number): void {
    this.isAlbumThumbnailValid = size <= 1000000; // 1 MB = 1,000,000 bytes
  }
}
