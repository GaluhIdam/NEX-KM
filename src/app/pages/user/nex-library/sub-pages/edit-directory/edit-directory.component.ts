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
import { KeycloakService } from 'keycloak-angular';
import { Subject, takeUntil, tap } from 'rxjs';
import { UnitDinasDTO } from 'src/app/core/dtos/nex-library/unit-dinas.dto';
import { WebDirectoryDTO } from 'src/app/core/dtos/nex-library/web-directory.dto';
import { HeaderService } from 'src/app/core/services/header/header.service';
import { UnitDinasDataService } from 'src/app/core/services/nex-library/unit-dinas-data.service';
import { WebDirectoryDataService } from 'src/app/core/services/nex-library/web-directory.service';
import { SoeDTO } from 'src/app/core/soe/soe.dto';
import { environment } from 'src/environments/environment.prod';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-directory',
  templateUrl: './edit-directory.component.html',
  styleUrls: ['./edit-directory.component.css'],
})
export class EditDirectoryComponent implements OnInit, OnDestroy {
  faTrash = faTrash;

  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  //Directory Cover File Action
  @ViewChild('directoryCoverFileInput', { static: false })
  directoryCoverFileInput!: ElementRef<HTMLInputElement>;
  selectedDirectoryCoverFile: File | null = null;
  directoryCoverFileDragging: Boolean = false;
  previewDirectoryCoverImage: string | undefined;

  directoryDetailData: WebDirectoryDTO | undefined;

  editDirectoryForm!: FormGroup;

  //Unit Dinas Data
  unitDinasData: UnitDinasDTO[] = [];

  // selected Unit Dinas
  selectedUnitDinas: UnitDinasDTO | undefined;

  isLoading: boolean;
  isImageLoading: boolean;

  user: SoeDTO | undefined;

  progress: number;

  //uuid from URL
  uuid: string | null;

  isDirectoryThumbnailValid: boolean;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly formBuilder: FormBuilder,
    private readonly webDirectoryDataService: WebDirectoryDataService,
    private readonly unitDinasDataService: UnitDinasDataService,
    private readonly headerService: HeaderService,
    private readonly keycloakService: KeycloakService
  ) {
    this.uuid = this.route.snapshot.paramMap.get('uuid');
    this.unitDinasData = [];
    this.isLoading = false;
    this.isImageLoading = false;
    this.progress = 0;
    this.isDirectoryThumbnailValid = false;
  }

  ngOnInit(): void {
    this.createPublishDirectoryForm();
    this.initUnitDinasData();
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

  initUnitDinasData(): void {
    this.isLoading = true;
    this.unitDinasDataService
      .getAllUnitDinasData()
      .pipe(takeUntil(this._onDestroy$))
      .subscribe((response) => {
        this.isLoading = false;
        this.unitDinasData = response.data;
        this.initEBookDetailData();
      });
  }

  initEBookDetailData(): void {
    if (this.uuid) {
      this.isLoading = true;
      this.webDirectoryDataService
        .getWebDirectoryDetailDataByUuid(this.uuid)
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
          this.directoryDetailData = response.data;
          this.getUserData(this.directoryDetailData.personalNumber);
          this.setDefaultValue(response.data);
        });
    }
  }

  createPublishDirectoryForm(): void {
    this.editDirectoryForm = this.formBuilder.nonNullable.group({
      title: ['', Validators.required],
      description: ['', [Validators.required]],
      link: ['', [Validators.required]],
      id_unit_dinas: [null, [Validators.required]],
      cover_image: [null, [Validators.required]],
    });
  }

  setDefaultValue(data: WebDirectoryDTO) {
    if (this.unitDinasData.length > 0) {
      this.selectedUnitDinas = this.unitDinasData.find(
        (dinas) => dinas.id === data.dinasId
      );
    }

    this.editDirectoryForm.patchValue({
      title: data.title,
      description: data.description,
      link: data.link,
      id_unit_dinas: this.selectedUnitDinas?.name,
    });

    this.fetchFile(data.path);
  }

  fetchFile(url: string): void {
    this.isImageLoading = true;
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const fileName = url.substring(url.lastIndexOf('/') + 1);
        const fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1);
        const objectType = `image/${fileExtension}`;

        const file = new File([blob], fileName, { type: objectType });

        this.isImageLoading = false;
        this.checkValidationDirectoryThumbnailSize(file.size);
        this.selectedDirectoryCoverFile = file;
        this.previewDirectoryCoverImage = url;
        this.editDirectoryForm.controls['cover_image'].setValue(file);
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

  get title() {
    return this.editDirectoryForm.get('title');
  }

  get description() {
    return this.editDirectoryForm.get('description');
  }

  get link() {
    return this.editDirectoryForm.get('link');
  }

  get id_unit_dinas() {
    return this.editDirectoryForm.get('id_unit_dinas');
  }

  get cover_image() {
    return this.editDirectoryForm.get('cover_image');
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
    this.editDirectoryForm.controls['cover_image'].markAsTouched();
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
    this.editDirectoryForm.controls['cover_image'].markAsTouched();
    fileInput.value = '';
  }

  isImageFile(file: File): boolean {
    const acceptedImageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    return file && acceptedImageTypes.includes(file.type);
  }

  readDirectoryCoverFile(file: File): void {
    this.selectedDirectoryCoverFile = file;
    this.checkValidationDirectoryThumbnailSize(file.size);
    this.editDirectoryForm.controls['cover_image'].setValue(file);
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      this.previewDirectoryCoverImage = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  onRemoveDirectoryCover(): void {
    this.selectedDirectoryCoverFile = null;
    this.previewDirectoryCoverImage = '';
    this.editDirectoryForm.controls['cover_image'].setValue(null);
  }

  triggerDirectoryCoverFileInputClick(): void {
    if (this.directoryCoverFileInput) {
      this.directoryCoverFileInput.nativeElement.click();
      this.editDirectoryForm.controls['cover_image'].markAsTouched();
    }
  }

  onSubmit() {
    if (this.user && this.directoryDetailData) {
      if (this.editDirectoryForm.invalid) {
        return;
      }

      const formData = new FormData();
      formData.append('cover_image', this.cover_image?.value);
      formData.append('title', this.title?.value);
      formData.append('description', this.description?.value);
      formData.append('link', this.link?.value);
      formData.append('personalNumber', this.user.personalNumber);
      formData.append(
        'id_unit_dinas',
        this.id_unit_dinas?.value.length > 1
          ? this.selectedUnitDinas?.id
          : this.id_unit_dinas?.value
      );

      if (this.uuid) {
        this.isLoading = true;
        this.webDirectoryDataService
          .updateWebDirectoryData(this.uuid, formData)
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
              }).then(() => {
                this.isLoading = false;
                this.progress = 0;
              });
            },
            () => {
              Swal.fire({
                icon: 'success',
                title: 'Great Move..',
                text: 'The Website you inputed has been edited',
              }).then(() => {
                this.isLoading = false;
                this.router.navigate(['/user/nex-library/manage-directory']);
              });
            }
          );
      }
    }
  }

  onPreviousPage() {
    this.router.navigate(['/user/nex-library/manage-directory']);
  }

  checkValidationDirectoryThumbnailSize(size: number): void {
    this.isDirectoryThumbnailValid = size <= 1000000; // 1 MB = 1,000,000 bytes
  }
}
