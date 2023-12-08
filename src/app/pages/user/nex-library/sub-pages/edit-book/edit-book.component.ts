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
import { Subject, takeUntil, tap } from 'rxjs';
import { EBookCategoryDTO } from 'src/app/core/dtos/nex-library/ebook-category.dto';
import { EBookCategoryDataService } from 'src/app/core/services/nex-library/ebook-category-data.service';
import { EBookDataService } from 'src/app/core/services/nex-library/ebook-data.service';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import { EBookDTO } from 'src/app/core/dtos/nex-library/ebook.dto';
import { HeaderService } from 'src/app/core/services/header/header.service';
import { SoeDTO } from 'src/app/core/soe/soe.dto';
@Component({
  selector: 'app-edit-book',
  templateUrl: './edit-book.component.html',
  styleUrls: ['./edit-book.component.css'],
})
export class EditBookComponent implements OnInit, OnDestroy {
  faTrash = faTrash;
  faFile = faFile;

  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  //EBook Cover Action
  @ViewChild('eBookPDFFileInput', { static: false })
  eBookPDFFileInput!: ElementRef<HTMLInputElement>;
  selectedEBookPDFFile: File | null = null;
  ebookPDFFileDragging: Boolean = false;
  previewEbookPDF: string | undefined;

  //EBook Cover File Action
  @ViewChild('eBookCoverFileInput', { static: false })
  eBookCoverFileInput!: ElementRef<HTMLInputElement>;
  selectedEBookCoverFile: File | null = null;
  ebookCoverFileDragging: Boolean = false;
  previewEbookCoverImage: string | undefined;

  //eBook Detail
  eBookDetailData: EBookDTO | undefined;

  editEBookForm!: FormGroup;

  //Category Popular Data
  eBookCategoryData: EBookCategoryDTO[];

  //uuid from URL
  uuid: string | null;

  // selected Category
  selectedDefaultCategory: EBookCategoryDTO | undefined;

  isLoading: boolean;
  isPDFLoading: boolean;
  isImageLoading: boolean;

  user: SoeDTO | undefined;
  personalNumber: string;

  progress: number;

  isEbookThumbnailValid: boolean;
  isEbookFileValid: boolean;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly formBuilder: FormBuilder,
    private readonly location: Location,
    private readonly eBookDataService: EBookDataService,
    private readonly eBookCategoryDataService: EBookCategoryDataService,
    private readonly headerService: HeaderService
  ) {
    this.uuid = this.route.snapshot.paramMap.get('uuid');
    this.eBookCategoryData = [];
    this.isLoading = false;
    this.isPDFLoading = false;
    this.isImageLoading = false;
    this.personalNumber = '';
    this.progress = 0;
    this.isEbookFileValid = false;
    this.isEbookThumbnailValid = false;
  }
  ngOnInit(): void {
    this.createEditEBookForm();
    this.initEBookCategoryData();
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

  initEBookCategoryData(): void {
    this.isLoading = true;
    this.eBookCategoryDataService
      .getEBookCategoryData('page=1&limit=1000&is_active=true')
      .pipe(tap(), takeUntil(this._onDestroy$))
      .subscribe((response) => {
        this.isLoading = false;
        this.eBookCategoryData = response.data.data;
        this.initEBookDetailData();
      });
  }

  initEBookDetailData(): void {
    if (this.uuid) {
      this.isLoading = true;
      this.eBookDataService
        .getEBookDetailDataByUuid(this.uuid)
        .pipe(
          tap((response) => {
            response.data.pathCover =
              environment.httpUrl +
              '/v1/api/file-manager/get-imagepdf/' +
              response.data.pathCover;
            response.data.pathEbook =
              environment.httpUrl +
              '/v1/api/file-manager/get-imagepdf/' +
              response.data.pathEbook;
          }),
          takeUntil(this._onDestroy$)
        )
        .subscribe((response) => {
          this.isLoading = false;
          this.eBookDetailData = response.data;
          this.getUserData(this.eBookDetailData.personalNumber);
          this.setDefaultValue(response.data);
        });
    }
  }

  createEditEBookForm(): void {
    this.editEBookForm = this.formBuilder.group({
      title: ['', Validators.required],
      synopsis: ['', [Validators.required]],
      overview: ['', [Validators.required]],
      author: ['', [Validators.required]],
      about_author: ['', [Validators.required]],
      ebook_category: [null, [Validators.required]],
      ebook_cover: [null, [Validators.required]],
      file_ebook: [null, [Validators.required]],
    });
  }

  setDefaultValue(data: EBookDTO) {
    if (this.eBookCategoryData.length > 0) {
      this.selectedDefaultCategory = this.eBookCategoryData.find(
        (category) => category.id === data.ebookCategoryId
      );
    }

    this.editEBookForm.patchValue({
      title: data.title,
      synopsis: data.synopsis,
      overview: data.overview,
      author: data.author,
      about_author: data.aboutAuthor,
      ebook_category: this.selectedDefaultCategory?.name,
    });

    this.fetchFile(data.pathEbook, 'pdf');
    this.fetchFile(data.pathCover, 'image');
  }

  fetchFile(url: string, type: string): void {
    this.isPDFLoading = true;
    this.isImageLoading = true;
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const fileName = url.substring(url.lastIndexOf('/') + 1);
        const fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1);
        const objectType =
          type === 'image'
            ? `image/${fileExtension}`
            : `application/${fileExtension}`;

        const file = new File([blob], fileName, { type: objectType });

        if (type === 'image') {
          this.isImageLoading = false;
          this.selectedEBookCoverFile = file;
          this.previewEbookCoverImage = url;
          this.editEBookForm.controls['ebook_cover'].setValue(file);
          this.checkValidationEbookThumbnailSize(file.size);
        } else if (type === 'pdf') {
          this.isPDFLoading = false;
          this.selectedEBookPDFFile = file;
          this.editEBookForm.controls['file_ebook'].setValue(file);
          this.checkValidationEbookFileSize(file.size);
        }
      })
      .catch(() => {
        if (type === 'image') {
          this.isImageLoading = false;
        } else if (type === 'pdf') {
          this.isPDFLoading = false;
        }
        Swal.fire({
          icon: 'error',
          title: 'Error Fetching File',
          text: 'Failed to fetch the file!',
        });
      });
  }

  get title() {
    return this.editEBookForm.get('title');
  }

  get synopsis() {
    return this.editEBookForm.get('synopsis');
  }

  get overview() {
    return this.editEBookForm.get('overview');
  }

  get author() {
    return this.editEBookForm.get('author');
  }

  get about_author() {
    return this.editEBookForm.get('about_author');
  }

  get ebook_category() {
    return this.editEBookForm.get('ebook_category');
  }

  get ebook_cover() {
    return this.editEBookForm.get('ebook_cover');
  }

  get file_ebook() {
    return this.editEBookForm.get('file_ebook');
  }

  onEBookCoverDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.ebookCoverFileDragging = true;
  }

  onEBookPDFDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.ebookPDFFileDragging = true;
  }

  onEBookCoverDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.ebookCoverFileDragging = false;
  }

  onEBookPDFDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.ebookPDFFileDragging = false;
  }

  onEBookCoverDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.ebookCoverFileDragging = false;

    const file = event.dataTransfer?.files[0];
    if (file) {
      if (this.isImageFile(file)) {
        this.readEBookCoverFile(file);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Wrong File',
          text: 'Please select only image file!',
        });
      }
    }
    this.editEBookForm.controls['ebook_cover'].markAsTouched();
  }

  onEBookPDFDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.ebookPDFFileDragging = false;

    const file = event.dataTransfer?.files[0];
    if (file) {
      if (this.isPDFFile(file)) {
        this.readEBookPDFFile(file);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Wrong File',
          text: 'Please select only PDF file!',
        });
      }
    }
    this.editEBookForm.controls['file_ebook'].markAsTouched();
  }

  onEBookCoverUploaded(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (file) {
      if (this.isImageFile(file)) {
        this.readEBookCoverFile(file);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Wrong File',
          text: 'Please select only image file!',
        });
      }
    }
    this.editEBookForm.controls['ebook_cover'].markAsTouched();
    fileInput.value = '';
  }

  onEBookPDFUploaded(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (file) {
      if (this.isPDFFile(file)) {
        this.readEBookPDFFile(file);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Wrong File',
          text: 'Please select only PDF file!',
        });
      }
    }
    this.editEBookForm.controls['file_ebook'].markAsTouched();
    fileInput.value = '';
  }

  isImageFile(file: File): boolean {
    const acceptedImageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    return file && acceptedImageTypes.includes(file.type);
  }

  isPDFFile(file: File): boolean {
    const acceptedPDFTypes = ['application/pdf'];
    return file && acceptedPDFTypes.includes(file.type);
  }

  readEBookCoverFile(file: File): void {
    this.selectedEBookCoverFile = file;
    this.checkValidationEbookThumbnailSize(file.size);
    this.editEBookForm.controls['ebook_cover'].setValue(file);
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      this.previewEbookCoverImage = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  readEBookPDFFile(file: File): void {
    this.selectedEBookPDFFile = file;
    this.checkValidationEbookFileSize(file.size);
    this.editEBookForm.controls['file_ebook'].setValue(file);
  }

  onRemoveEBookCover(): void {
    this.selectedEBookCoverFile = null;
    this.previewEbookCoverImage = '';
    this.editEBookForm.controls['ebook_cover'].setValue(null);
  }

  onRemoveEBookPDF(): void {
    this.selectedEBookPDFFile = null;
    this.previewEbookPDF = '';
    this.editEBookForm.controls['file_ebook'].setValue(null);
  }

  triggerEBookCoverFileInputClick(): void {
    if (this.eBookCoverFileInput) {
      this.eBookCoverFileInput.nativeElement.click();
      this.editEBookForm.controls['ebook_cover'].markAsTouched();
    }
  }

  triggerEBookPDFFileInputClick(): void {
    if (this.eBookPDFFileInput) {
      this.eBookPDFFileInput.nativeElement.click();
      this.editEBookForm.controls['file_ebook'].markAsTouched();
    }
  }

  onSubmit() {
    if (this.eBookDetailData && this.user) {
      if (this.editEBookForm.invalid) {
        return;
      }

      const formData = new FormData();
      formData.append('file_ebook', this.file_ebook?.value);
      formData.append('ebook_cover', this.ebook_cover?.value);
      formData.append('title', this.title?.value);
      formData.append('synopsis', this.synopsis?.value);
      formData.append('overview', this.overview?.value);
      formData.append('author', this.author?.value);
      formData.append('about_author', this.about_author?.value);
      formData.append(
        'ebook_category',
        this.ebook_category?.value.length > 1
          ? this.selectedDefaultCategory?.id
          : this.ebook_category?.value
      );
      formData.append('personalNumber', this.eBookDetailData.personalNumber);
      formData.append('upload_by', this.user.personalName);
      formData.append('unit', this.user.personalUnit);

      if (this.uuid) {
        this.isLoading = true;
        this.eBookDataService.updateData(this.uuid, formData).subscribe(
          (event: any) => {
            if (event['loaded'] && event['total']) {
              this.progress = Math.round(
                (event['loaded'] / event['total']) * 100
              );
            }
          },
          (error) => {
            this.isLoading = false;
            this.progress = 0;
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: error.error.message,
            });
          },
          () => {
            this.isLoading = false;
            this.router.navigate(['/user/nex-library/manage-book']);
            Swal.fire({
              icon: 'success',
              title: 'Great Move..',
              text: 'The Ebook you inputed has been edited',
            });
          }
        );
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Cannot edit e-book!',
        });
      }
    }
  }

  onPreviousPage() {
    this.location.back();
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

  checkValidationEbookFileSize(size: number): void {
    this.isEbookFileValid = size <= 10000000; // 10 MB = 10,000,000 bytes
  }

  checkValidationEbookThumbnailSize(size: number): void {
    this.isEbookThumbnailValid = size <= 1000000; // 1 MB = 1,000,000 bytes
  }
}
