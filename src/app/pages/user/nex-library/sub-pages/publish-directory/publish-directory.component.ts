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
import { Subject, takeUntil } from 'rxjs';
import { UnitDinasDTO } from 'src/app/core/dtos/nex-library/unit-dinas.dto';
import { HeaderService } from 'src/app/core/services/header/header.service';
import { UnitDinasDataService } from 'src/app/core/services/nex-library/unit-dinas-data.service';
import { WebDirectoryDataService } from 'src/app/core/services/nex-library/web-directory.service';
import { SoeDTO } from 'src/app/core/soe/soe.dto';
import { SocketService } from 'src/app/core/utility/socket-io-services/socket.io.service';
import Swal from 'sweetalert2';
import { HomePageService } from '../../../home-page/homepage.service';
import { NotificationRequestDTO } from '../../../home-page/dtos/notification.dto';

@Component({
  selector: 'app-publish-directory',
  templateUrl: './publish-directory.component.html',
  styleUrls: ['./publish-directory.component.css'],
})
export class PublishDirectoryComponent implements OnInit, OnDestroy {
  files: File[] = [];
  check: any = [];
  addedFiles: any;

  onSelect(event: { addedFiles: any }) {
    this.files.push(...event.addedFiles);
    this.check.push(1);
    console.log(this.check);
  }
  onRemove(event: File) {
    this.files.splice(this.files.indexOf(event), 1);
  }

  faTrash = faTrash;

  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  //Directory Cover File Action
  @ViewChild('directoryCoverFileInput', { static: false })
  directoryCoverFileInput!: ElementRef<HTMLInputElement>;
  selectedDirectoryCoverFile: File | null = null;
  directoryCoverFileDragging: Boolean = false;
  previewDirectoryCoverImage: string | undefined;

  publishDirectoryForm!: FormGroup;

  //Unit Dinas Data
  unitDinasData: UnitDinasDTO[] = [];

  isLoading: boolean;

  user: SoeDTO | undefined;
  personalNumber: string;

  progress: number;

  isDirectoryThumbnailValid: boolean;

  constructor(
    private readonly router: Router,
    private readonly formBuilder: FormBuilder,
    private readonly webDirectoryDataService: WebDirectoryDataService,
    private readonly unitDinasDataService: UnitDinasDataService,
    private readonly headerService: HeaderService,
    private readonly keycloakService: KeycloakService,
    private readonly webSocket: SocketService,
    private readonly homepageService: HomePageService
  ) {
    this.unitDinasData = [];
    this.isLoading = false;
    this.personalNumber = '';
    this.progress = 0;
    this.isDirectoryThumbnailValid = false;
  }

  ngOnInit(): void {
    this.initializeUserOptions();
    this.getUserData(this.personalNumber);
    this.createPublishDirectoryForm();
    this.initUnitDinasData();
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

  initUnitDinasData(): void {
    this.isLoading = true;
    this.unitDinasDataService
      .getAllUnitDinasData()
      .pipe(takeUntil(this._onDestroy$))
      .subscribe((response) => {
        this.isLoading = false;
        this.unitDinasData = response.data;
      });
  }

  createPublishDirectoryForm(): void {
    this.publishDirectoryForm = this.formBuilder.nonNullable.group({
      title: ['', Validators.required],
      description: ['', [Validators.required]],
      link: ['', [Validators.required]],
      id_unit_dinas: [null, [Validators.required]],
      cover_image: [null, [Validators.required]],
    });
  }

  get title() {
    return this.publishDirectoryForm.get('title');
  }

  get description() {
    return this.publishDirectoryForm.get('description');
  }

  get link() {
    return this.publishDirectoryForm.get('link');
  }

  get id_unit_dinas() {
    return this.publishDirectoryForm.get('id_unit_dinas');
  }

  get cover_image() {
    return this.publishDirectoryForm.get('cover_image');
  }

  onDirectoryCoverDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.directoryCoverFileDragging = true;
  }

  onDirectoryCoverDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.directoryCoverFileDragging = false;
  }

  onDirectoryCoverDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.directoryCoverFileDragging = false;

    const file = event.dataTransfer?.files[0];
    if (file) {
      if (this.isImageFile(file)) {
        this.readDirectoryCoverFile(file);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Wrong File',
          text: 'Please select only image file!',
        });
      }
    }
    this.publishDirectoryForm.controls['cover_image'].markAsTouched();
  }

  onDirectoryCoverUploaded(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (file) {
      if (this.isImageFile(file)) {
        this.readDirectoryCoverFile(file);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Wrong File',
          text: 'Please select only image file!',
        });
      }
    }
    this.publishDirectoryForm.controls['cover_image'].markAsTouched();
    fileInput.value = '';
  }

  isImageFile(file: File): boolean {
    const acceptedImageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    return file && acceptedImageTypes.includes(file.type);
  }

  readDirectoryCoverFile(file: File): void {
    this.selectedDirectoryCoverFile = file;
    this.checkValidationDirectoryThumbnailSize(file.size);
    this.publishDirectoryForm.controls['cover_image'].setValue(file);
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      this.previewDirectoryCoverImage = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  onRemoveDirectoryCover(): void {
    this.selectedDirectoryCoverFile = null;
    this.previewDirectoryCoverImage = '';
    this.publishDirectoryForm.controls['cover_image'].setValue(null);
  }

  triggerDirectoryCoverFileInputClick(): void {
    if (this.directoryCoverFileInput) {
      this.directoryCoverFileInput.nativeElement.click();
      this.publishDirectoryForm.controls['cover_image'].markAsTouched();
    }
  }

  onSubmit() {
    if (this.user) {
      if (this.publishDirectoryForm.invalid) {
        return;
      }
      const formData = new FormData();
      formData.append('cover_image', this.cover_image?.value);
      formData.append('title', this.title?.value);
      formData.append('description', this.description?.value);
      formData.append('link', this.link?.value);
      formData.append('id_unit_dinas', this.id_unit_dinas?.value);
      formData.append('personalNumber', this.personalNumber);

      this.isLoading = true;
      this.webDirectoryDataService.storeWebDirectoryData(formData).subscribe(
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
            text: 'The Ebook you inputed has been submitted and now is waiting approval',
          }).then(() => {
            this.isLoading = false;
            this.router.navigate(['/user/nex-library/directory']);
          });
        }
      );
    }
  }

  onPreviousPage() {
    this.router.navigate(['/user/nex-library/directory']);
  }

  checkValidationDirectoryThumbnailSize(size: number): void {
    this.isDirectoryThumbnailValid = size <= 1000000; // 1 MB = 1,000,000 bytes
  }
}
