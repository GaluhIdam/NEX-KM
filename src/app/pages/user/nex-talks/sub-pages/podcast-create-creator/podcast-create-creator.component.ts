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
  faChevronRight,
  faEllipsis,
  faTrash,
  faUpload,
} from '@fortawesome/free-solid-svg-icons';
import { KeycloakService } from 'keycloak-angular';
import { Subject, takeUntil } from 'rxjs';
import { TalkCategoryDTO } from 'src/app/core/dtos/nex-talk/talk-category.dto';
import { CreatorDataService } from 'src/app/core/services/nex-talk/creator-data.service';
import { TalkCategoryDataService } from 'src/app/core/services/nex-talk/talk-category.service';
import { SoeDTO } from 'src/app/core/soe/soe.dto';
import Swal from 'sweetalert2';
import { HeaderService } from '../../../../../core/services/header/header.service';

@Component({
  selector: 'app-podcast-create-creator',
  templateUrl: './podcast-create-creator.component.html',
  styleUrls: ['./podcast-create-creator.component.css'],
})
export class PodcastCreateCreatorComponent implements OnInit, OnDestroy {
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

  talkCategoryData: TalkCategoryDTO[];

  creatorForm!: FormGroup;
  personalNumber: string;

  progress: number;

  isLoading: boolean;

  user: SoeDTO | undefined;

  constructor(
    private readonly router: Router,
    private readonly formBuilder: FormBuilder,
    private readonly keycloakService: KeycloakService,
    private readonly headerService: HeaderService,
    private readonly creatorDataService: CreatorDataService,
    private readonly talkCategoryDataService: TalkCategoryDataService
  ) {
    this.talkCategoryData = [];
    this.personalNumber = '';
    this.progress = 0;
    this.isLoading = false;
  }

  ngOnInit(): void {
    this.initializeUserOptions();
    this.getUserData(this.personalNumber);
    this.createcreatorForm();
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
    let params: string = `page=${1}&limit=${1000}&status=true`;

    this.talkCategoryDataService
      .getTalkCategoryData(params)
      .pipe(takeUntil(this._onDestroy$))
      .subscribe((response) => {
        this.isLoading = false;
        this.talkCategoryData = response.data.data;
      });
  }

  createcreatorForm(): void {
    this.creatorForm = this.formBuilder.nonNullable.group({
      name: ['', Validators.required],
      description: ['', [Validators.required]],
      talkCategoryId: ['', [Validators.required]],
      image: [null, [Validators.required]],
    });
  }

  get name() {
    return this.creatorForm.get('name');
  }

  get description() {
    return this.creatorForm.get('description');
  }

  get talkCategoryId() {
    return this.creatorForm.get('talkCategoryId');
  }

  get image() {
    return this.creatorForm.get('image');
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
    this.creatorForm.controls['image'].markAsTouched();
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
    this.creatorForm.controls['image'].markAsTouched();
    fileInput.value = '';
  }

  isImageFile(file: File): boolean {
    const acceptedImageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    return file && acceptedImageTypes.includes(file.type);
  }

  readImageFile(file: File): void {
    this.selectedImageFile = file;
    this.creatorForm.controls['image'].setValue(file);
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      this.previewImage = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  onRemoveImage(): void {
    this.selectedImageFile = null;
    this.previewImage = '';
    this.creatorForm.controls['image'].setValue(null);
  }

  triggerImageFileInputClick(): void {
    if (this.imageFileInput) {
      this.imageFileInput.nativeElement.click();
      this.creatorForm.controls['image'].markAsTouched();
    }
  }

  onSubmit() {
    if (this.creatorForm.invalid) {
      return;
    }

    if (this.user) {
      const formData = new FormData();
      formData.append('image', this.image?.value);
      formData.append('name', this.name?.value);
      formData.append('description', this.description?.value);
      formData.append('personalNumber', this.personalNumber);
      formData.append('talkCategoryId', this.talkCategoryId?.value);
      formData.append('createdBy', this.user.personalName);
      formData.append('unit', this.user.personalUnit);

      this.isLoading = true;
      this.creatorDataService.storeCreatorData(formData).subscribe(
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
      text: 'Are you sure want to create a channel?',
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
      text: 'Successfully create a channel',
    }).then((result) => {
      this.onPreviousPage();
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
