import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { PlyrComponent } from 'ngx-plyr';
import * as Plyr from 'plyr';
import {
  faEllipsis,
  faChevronRight,
  faTrash,
  faFileUpload,
  faUpload,
} from '@fortawesome/free-solid-svg-icons';
import { Subject, takeUntil, tap } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { SerieDataService } from 'src/app/core/services/nex-talk/serie-data.service';
import { CreatorDataService } from 'src/app/core/services/nex-talk/creator-data.service';
import { CreatorDTO } from 'src/app/core/dtos/nex-talk/creator.dto';

@Component({
  selector: 'app-podcast-create-new-series',
  templateUrl: './podcast-create-new-series.component.html',
  styleUrls: ['./podcast-create-new-series.component.css'],
})
export class PodcastCreateNewSeriesComponent implements OnInit, OnDestroy {
  faEllipsis = faEllipsis;
  faChevronRight = faChevronRight;
  faTrash = faTrash;
  faUpload = faUpload;

  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  //Image File Action
  @ViewChild('imageFileInput', { static: false })
  imageFileInput!: ElementRef<HTMLInputElement>;
  selectedImageFile: File | null = null;
  imageFileDragging: Boolean = false;
  previewImage: string | undefined;

  creatorData: CreatorDTO[];

  serieForm!: FormGroup;
  personalNumber: string;

  progress: number;

  isLoading: boolean;

  constructor(
    private readonly router: Router,
    private readonly formBuilder: FormBuilder,
    private readonly keycloakService: KeycloakService,
    private readonly serieDataService: SerieDataService,
    private readonly creatorDataService: CreatorDataService
  ) {
    this.creatorData = [];
    this.personalNumber = '';
    this.progress = 0;
    this.isLoading = false;
  }

  ngOnInit(): void {
    this.initializeUserOptions();
    this.createSerieForm();
    this.initCreatorData();
  }

  ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.unsubscribe();
  }

  //GET Personal Number from Keycloak
  private initializeUserOptions(): void {
    this.personalNumber = this.keycloakService.getUsername();
  }

  initCreatorData(): void {
    this.isLoading = true;
    let params: string = `page=${1}&limit=${1000}&personal_number=${
      this.personalNumber
    }`;

    this.creatorDataService
      .getCreatorData(params)
      .pipe(takeUntil(this._onDestroy$))
      .subscribe((response) => {
        this.isLoading = false;
        this.creatorData = response.data.data;
      });
  }

  createSerieForm(): void {
    this.serieForm = this.formBuilder.nonNullable.group({
      title: ['', Validators.required],
      description: ['', [Validators.required]],
      image: [null, [Validators.required]],
    });
  }

  get title() {
    return this.serieForm.get('title');
  }

  get description() {
    return this.serieForm.get('description');
  }

  get image() {
    return this.serieForm.get('image');
  }

  onImageDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.imageFileDragging = true;
  }

  onImageDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.imageFileDragging = false;
  }

  onImageDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.imageFileDragging = false;

    const file = event.dataTransfer?.files[0];
    if (file) {
      if (this.isImageFile(file)) {
        this.readImageFile(file);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Wrong File',
          text: 'Please select only image file!',
        });
      }
    }
    this.serieForm.controls['image'].markAsTouched();
  }

  onImageUploaded(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (file) {
      if (this.isImageFile(file)) {
        this.readImageFile(file);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Wrong File',
          text: 'Please select only image file!',
        });
      }
    }
    this.serieForm.controls['image'].markAsTouched();
    fileInput.value = '';
  }

  isImageFile(file: File): boolean {
    const acceptedImageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    return file && acceptedImageTypes.includes(file.type);
  }

  readImageFile(file: File): void {
    this.selectedImageFile = file;
    this.serieForm.controls['image'].setValue(file);
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      this.previewImage = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  onRemoveImage(): void {
    this.selectedImageFile = null;
    this.previewImage = '';
    this.serieForm.controls['image'].setValue(null);
  }

  triggerImageFileInputClick(): void {
    if (this.imageFileInput) {
      this.imageFileInput.nativeElement.click();
      this.serieForm.controls['image'].markAsTouched();
    }
  }

  onSubmit() {
    if (this.serieForm.invalid) {
      return;
    }

    if (this.creatorData.length > 0) {
      const formData = new FormData();
      formData.append('image', this.image?.value);
      formData.append('title', this.title?.value);
      formData.append('description', this.description?.value);
      formData.append('personalNumber', this.personalNumber);
      formData.append('creatorId', String(this.creatorData[0].id));

      this.isLoading = true;
      this.serieDataService.storeSerieData(formData).subscribe(
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
          this.isLoading = false;
          this.onConfirmationAfterSubmit();
        }
      );
    }
  }

  onPreviousPage() {
    this.router.navigate(['/user/nex-talks/podcast/my-podcast']);
  }

  onGotoUploadPodcastPage() {
    this.router.navigate(['/user/nex-talks/podcast/my-podcast/upload']);
  }

  onSaveClick() {
    Swal.fire({
      icon: 'info',
      title: 'Save Confirmation',
      text: 'Are you sure want to create new serie?',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: ' #d33',
      confirmButtonText: 'Yes',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.onSubmit();
      }
    });
  }
  onConfirmationAfterSubmit() {
    Swal.fire({
      icon: 'success',
      title: 'Great Move..',
      text: 'The Serie you inputed has been created. What Next?',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonText: 'Back to my podcast',
      confirmButtonText: 'Upload new podcast',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.onGotoUploadPodcastPage();
      } else {
        this.onPreviousPage();
      }
    });
  }

  onCancelClick() {
    Swal.fire({
      icon: 'info',
      title: 'Cancel Confirmation',
      text: 'Are you sure want to leave this page?',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.onPreviousPage();
      }
    });
  }
}
