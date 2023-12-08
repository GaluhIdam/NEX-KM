import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EBookDataService } from 'src/app/core/services/nex-library/ebook-data.service';
import { Subject, takeUntil, tap } from 'rxjs';
import { faFile, faTrash } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import { EBookCategoryDataService } from 'src/app/core/services/nex-library/ebook-category-data.service';
import { EBookCategoryDTO } from 'src/app/core/dtos/nex-library/ebook-category.dto';
import { Location } from '@angular/common';
import { HeaderService } from 'src/app/core/services/header/header.service';
import { KeycloakService } from 'keycloak-angular';
import { SoeDTO } from 'src/app/core/soe/soe.dto';
import { LocalService } from 'src/app/core/services/local/local.service';
import { NotificationRequestDTO } from '../../../home-page/dtos/notification.dto';
import { SocketService } from 'src/app/core/utility/socket-io-services/socket.io.service';
import { HomePageService } from '../../../home-page/homepage.service';
import { EBookDTO } from 'src/app/core/dtos/nex-library/ebook.dto';

@Component({
  selector: 'app-publish-book',
  templateUrl: './publish-book.component.html',
  styleUrls: ['./publish-book.component.css'],
})
export class PublishBookComponent implements OnInit, OnDestroy {
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

  publishEBookForm!: FormGroup;

  //Category Popular Data
  eBookCategoryData: EBookCategoryDTO[];

  isLoading: boolean;

  user: SoeDTO | undefined;
  personalNumber: string;

  progress: number;

  isEbookThumbnailValid: boolean;
  isEbookFileValid: boolean;

  constructor(
    private readonly router: Router,
    private readonly location: Location,
    private readonly formBuilder: FormBuilder,
    private readonly eBookDataService: EBookDataService,
    private readonly eBookCategoryDataService: EBookCategoryDataService,
    private readonly headerService: HeaderService,
    private readonly keycloakService: KeycloakService,
    private readonly localService: LocalService,
    private readonly webSocket: SocketService,
    private readonly homepageService: HomePageService
  ) {
    this.eBookCategoryData = [];
    this.isLoading = false;
    this.personalNumber = '';
    this.progress = 0;
    this.isEbookThumbnailValid = false;
    this.isEbookFileValid = false;
  }

  ngOnInit(): void {
    this.initializeUserOptions();
    this.getUserData(this.personalNumber);
    this.initEBookCategoryData();
    this.createPublishEBookForm();
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

  initEBookCategoryData(): void {
    this.isLoading = true;
    this.eBookCategoryDataService
      .getEBookCategoryData('page=1&limit=1000&is_active=true')
      .pipe(takeUntil(this._onDestroy$))
      .subscribe((response) => {
        this.isLoading = false;
        this.eBookCategoryData = response.data.data;
      });
  }

  createPublishEBookForm(): void {
    this.publishEBookForm = this.formBuilder.nonNullable.group({
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

  get title() {
    return this.publishEBookForm.get('title');
  }

  get synopsis() {
    return this.publishEBookForm.get('synopsis');
  }

  get overview() {
    return this.publishEBookForm.get('overview');
  }

  get author() {
    return this.publishEBookForm.get('author');
  }

  get about_author() {
    return this.publishEBookForm.get('about_author');
  }

  get ebook_category() {
    return this.publishEBookForm.get('ebook_category');
  }

  get ebook_cover() {
    return this.publishEBookForm.get('ebook_cover');
  }

  get file_ebook() {
    return this.publishEBookForm.get('file_ebook');
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
    this.publishEBookForm.controls['ebook_cover'].markAsTouched();
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
    this.publishEBookForm.controls['file_ebook'].markAsTouched();
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
    this.publishEBookForm.controls['ebook_cover'].markAsTouched();
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
    this.publishEBookForm.controls['file_ebook'].markAsTouched();
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
    this.publishEBookForm.controls['ebook_cover'].setValue(file);
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      this.previewEbookCoverImage = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  readEBookPDFFile(file: File): void {
    this.selectedEBookPDFFile = file;
    this.checkValidationEbookFileSize(file.size);
    this.publishEBookForm.controls['file_ebook'].setValue(file);
  }

  onRemoveEBookCover(): void {
    this.selectedEBookCoverFile = null;
    this.previewEbookCoverImage = '';
    this.publishEBookForm.controls['ebook_cover'].setValue(null);
  }

  onRemoveEBookPDF(): void {
    this.selectedEBookPDFFile = null;
    this.previewEbookPDF = '';
    this.publishEBookForm.controls['file_ebook'].setValue(null);
  }

  triggerEBookCoverFileInputClick(): void {
    if (this.eBookCoverFileInput) {
      this.eBookCoverFileInput.nativeElement.click();
      this.publishEBookForm.controls['ebook_cover'].markAsTouched();
    }
  }

  triggerEBookPDFFileInputClick(): void {
    if (this.eBookPDFFileInput) {
      this.eBookPDFFileInput.nativeElement.click();
      this.publishEBookForm.controls['file_ebook'].markAsTouched();
    }
  }

  onSubmit() {
    if (this.user) {
      if (this.publishEBookForm.invalid) {
        return;
      }
      const socket: NotificationRequestDTO = {
        senderPersonalNumber: this.keycloakService.getUsername(),
        receiverPersonalNumber: '782659',
        title: 'Create Ebook',
        description: 'Create Ebook Successfully',
        isRead: 'false',
        contentType: 'ebook',
        contentUuid: 'nice'
      };
      this.webSocket.sendSocket(socket).subscribe(),
      this.homepageService.createNotification(socket).subscribe();
      const formData = new FormData();
      formData.append('file_ebook', this.file_ebook?.value);
      formData.append('ebook_cover', this.ebook_cover?.value);
      formData.append('title', this.title?.value);
      formData.append('synopsis', this.synopsis?.value);
      formData.append('overview', this.overview?.value);
      formData.append('author', this.author?.value);
      formData.append('about_author', this.about_author?.value);
      formData.append('ebook_category', this.ebook_category?.value);
      formData.append('personalNumber', this.personalNumber);
      formData.append('upload_by', this.user.personalName);
      formData.append('unit', this.user.personalUnit);

      this.isLoading = true;
      this.eBookDataService.storeEbookData(formData).subscribe(
        (event: any) => {
          if (event.type === 4) {
            const socket: NotificationRequestDTO = {
              senderPersonalNumber: this.keycloakService.getUsername(),
              receiverPersonalNumber: '782659',
              title: 'New Ebook needs your approval',
              description: `Ebook with title ${this.title?.value} has been created and is now waiting your approval`,
              isRead: 'false',
              contentType: 'ebook',
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
              this.progress = Math.round(
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
            this.onPreviousPage();
          });
        }
      );
    }
  }

  onPreviousPage() {
    const backRouting = this.localService.getData(
      'url_back_from_publish_ebook'
    );

    if (backRouting !== null) {
      this.router.navigate([backRouting]);
    } else {
      this.router.navigate(['/user/nex-library/ebook']);
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

  checkValidationEbookFileSize(size: number): void {
    this.isEbookFileValid = size <= 10000000; // 10 MB = 10,000,000 bytes
  }

  checkValidationEbookThumbnailSize(size: number): void {
    this.isEbookThumbnailValid = size <= 1000000; // 1 MB = 1,000,000 bytes
  }
}
