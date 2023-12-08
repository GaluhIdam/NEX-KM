import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  faArrowRight,
  faBell,
  faGear,
  faSearch,
  faFilter,
  faPrint,
  faPencil,
  faSave,
  faCancel,
  faBan,
  faXmark,
  faCircleCheck,
  faTrash,
  faFile,
  faStar,
} from '@fortawesome/free-solid-svg-icons';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject, filter, takeUntil, tap } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EBookDataService } from 'src/app/core/services/nex-library/ebook-data.service';
import { EBookReviewDataService } from 'src/app/core/services/nex-library/ebook-review-data.service';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import { EBookDTO } from 'src/app/core/dtos/nex-library/ebook.dto';
import { EBookCategoryDTO } from 'src/app/core/dtos/nex-library/ebook-category.dto';
import { EBookCategoryDataService } from 'src/app/core/services/nex-library/ebook-category-data.service';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';
import { SoeDTO } from 'src/app/core/soe/soe.dto';
import { HeaderService } from 'src/app/core/services/header/header.service';
import { KeycloakService } from 'keycloak-angular';
import { Modal, initTE, Ripple } from 'tw-elements';

@Component({
  selector: 'app-detail-ebook',
  templateUrl: './detail-ebook.component.html',
  styleUrls: ['./detail-ebook.component.css'],
})
export class DetailEbookComponent implements OnInit, OnDestroy {
  faArrowRight = faArrowRight;
  faBell = faBell;
  faGear = faGear;
  faSearch = faSearch;
  faFilter = faFilter;
  faPrint = faPrint;
  faPencil = faPencil;
  faSave = faSave;
  faCancelEdit = faCancel;
  faBan = faBan;
  faXmark = faXmark;
  faCircleCheck = faCircleCheck;
  faTrash = faTrash;
  faFile = faFile;
  faStar = faStar;

  //EBook PDF File Action
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

  titlePage: any;

  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  eBookForm!: FormGroup;

  //uuid from URL
  uuid: string | null;
  user: SoeDTO | undefined;

  //eBook Detail
  eBookDetailData: EBookDTO | undefined;

  //Category Popular Data
  eBookCategoryData: EBookCategoryDTO[];

  // selected Category
  selectedDefaultCategory: EBookCategoryDTO | undefined;

  isLoading: boolean;

  editMode: boolean;

  totalReviewRate: number;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private readonly location: Location,
    private readonly route: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    private readonly eBookDataService: EBookDataService,
    private readonly eBookReviewDataService: EBookReviewDataService,
    private readonly eBookCategoryDataService: EBookCategoryDataService,
    private readonly headerService: HeaderService,
    private readonly keycloakService: KeycloakService,
  ) {
    const requestUuid = this.route.snapshot.paramMap.get('uuid');
    this.uuid = requestUuid;
    this.isLoading = true;
    this.editMode = false;
    this.eBookCategoryData = [];
    this.totalReviewRate = 0;
  }

  ngOnInit() {
    initTE({ Modal, Ripple });
    this.initTitlePage();
    this.createEBookForm();
    this.initEBookDetailData();
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
      .getEBookCategoryData('page=1&limit=1000')
      .pipe(tap(), takeUntil(this._onDestroy$))
      .subscribe((response) => {
        this.eBookCategoryData = response.data.data;
        this.isLoading = false;
        this.setDefaultValue(this.eBookDetailData);
      });
  }

  initEBookDetailData(): void {
    if (this.uuid) {
      this.isLoading = true;
      this.eBookDataService
        .getEBookDetailDataByUuid(this.uuid)
        .pipe(
          tap((response) => {
            if (response.data.approvalBy) {
              this.getUserData(response.data.approvalBy);
            }

            response.data.pathCover =
              environment.httpUrl +
              '/v1/api/file-manager/get-imagepdf/' +
              response.data.pathCover;
            response.data.pathEbook =
              environment.httpUrl +
              '/v1/api/file-manager/get-imagepdf/' +
              response.data.pathEbook;

            // calculate star rating from reviews
            let rateTotal = 0;
            let reviewsLength = response.data.ebooksEbookReviews.length;
            response.data.ebooksEbookReviews.map((review) => {
              rateTotal += review.rate;
            });
            if (rateTotal !== 0 && reviewsLength > 0) {
              this.totalReviewRate = rateTotal / reviewsLength;
            }
          }),
          takeUntil(this._onDestroy$)
        )
        .subscribe((response) => {
          this.isLoading = false;
          this.eBookDetailData = response.data;
          this.setDefaultValue(this.eBookDetailData);
        });
    }
  }

  initTitlePage(): void {
    this.activatedRoute.data.subscribe((data) => {
      this.titlePage = data;
    });
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        var rt = this.getChild(this.activatedRoute);

        rt.data.subscribe((data: { title: string }) => {
          this.titleService.setTitle('Nex ' + data.title);
        });
      });
  }

  getChild(activatedRoute: ActivatedRoute): any {
    if (activatedRoute.firstChild) {
      return this.getChild(activatedRoute.firstChild);
    } else {
      return activatedRoute;
    }
  }

  createEBookForm(): void {
    this.eBookForm = this.formBuilder.group({
      title: [{ value: '', disabled: true }, Validators.required],
      synopsis: [{ value: '', disabled: true }, [Validators.required]],
      overview: [{ value: '', disabled: true }, [Validators.required]],
      author: [{ value: '', disabled: true }, [Validators.required]],
      about_author: [{ value: '', disabled: true }, [Validators.required]],
      ebook_category: [{ value: null, disabled: true }, [Validators.required]],
      ebook_cover: [{ value: null, disabled: true }, [Validators.required]],
      file_ebook: [{ value: null, disabled: true }, [Validators.required]],
    });
  }

  setDefaultValue(data?: EBookDTO) {
    if (data) {
      if (this.eBookCategoryData.length > 0) {
        this.selectedDefaultCategory = this.eBookCategoryData.find(
          (category) => category.id === data.ebookCategoryId
        );
      }

      if (
        this.selectedDefaultCategory &&
        this.selectedDefaultCategory.name.length > 30
      ) {
        this.selectedDefaultCategory.name =
          this.selectedDefaultCategory.name.substring(0, 30) + '...';
      }

      this.eBookForm.patchValue({
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
  }

  fetchFile(url: string, type: string): void {
    this.isLoading = true;
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
          this.selectedEBookCoverFile = file;
          this.previewEbookCoverImage = url;
          this.eBookForm.controls['ebook_cover'].setValue(file);
        } else if (type === 'pdf') {
          this.selectedEBookPDFFile = file;
          this.eBookForm.controls['file_ebook'].setValue(file);
        }
        this.isLoading = false;
      })
      .catch((error) => {
        console.error(error);
        Swal.fire({
          icon: 'error',
          title: 'Error Fetching File',
          text: 'Failed to fetch the file!',
        });
      });
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
    this.eBookForm.controls['ebook_cover'].markAsTouched();
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
    this.eBookForm.controls['file_ebook'].markAsTouched();
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
    this.eBookForm.controls['ebook_cover'].setValue(file);
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      this.previewEbookCoverImage = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  readEBookPDFFile(file: File): void {
    this.selectedEBookPDFFile = file;
    this.eBookForm.controls['file_ebook'].setValue(file);
  }

  onRemoveEBookCover(): void {
    this.selectedEBookCoverFile = null;
    this.previewEbookCoverImage = '';
    this.eBookForm.controls['ebook_cover'].setValue(null);
    this.eBookForm.controls['ebook_cover'].markAsTouched();
  }

  onRemoveEBookPDF(): void {
    this.selectedEBookPDFFile = null;
    this.previewEbookPDF = '';
    this.eBookForm.controls['file_ebook'].setValue(null);
    this.eBookForm.controls['file_ebook'].markAsTouched();
  }

  triggerEBookCoverFileInputClick(): void {
    if (this.eBookCoverFileInput) {
      this.eBookCoverFileInput.nativeElement.click();
      this.eBookForm.controls['ebook_cover'].markAsTouched();
    }
  }

  triggerEBookPDFFileInputClick(): void {
    if (this.eBookPDFFileInput) {
      this.eBookPDFFileInput.nativeElement.click();
      this.eBookForm.controls['file_ebook'].markAsTouched();
    }
  }

  get title() {
    return this.eBookForm.get('title');
  }

  get synopsis() {
    return this.eBookForm.get('synopsis');
  }

  get overview() {
    return this.eBookForm.get('overview');
  }

  get author() {
    return this.eBookForm.get('author');
  }

  get about_author() {
    return this.eBookForm.get('about_author');
  }

  get ebook_category() {
    return this.eBookForm.get('ebook_category');
  }

  get ebook_cover() {
    return this.eBookForm.get('ebook_cover');
  }

  get file_ebook() {
    return this.eBookForm.get('file_ebook');
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
    this.eBookForm.controls['ebook_cover'].markAsTouched();
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
    this.eBookForm.controls['file_ebook'].markAsTouched();
  }

  onSubmit() {
    if (this.eBookForm.invalid) {
      return;
    }
    if (this.eBookDetailData) {
      this.isLoading = true;
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
        this.ebook_category?.value?.length > 1
          ? this.selectedDefaultCategory?.id
          : this.ebook_category?.value
      );
      formData.append('personalNumber', this.eBookDetailData.personalNumber);
      formData.append('upload_by', this.eBookDetailData.uploadBy);
      formData.append('unit', this.eBookDetailData.unit);
      if (this.uuid) {
        this.eBookDataService.updateData(this.uuid, formData).subscribe(
          (success) => {
            Swal.fire({
              icon: 'success',
              title: 'Great Move..',
              text: 'The EBook you inputed has been edited',
            }).then(() => {
              this.isLoading = false;
              this.onCancelEditMode();
            });
          },
          (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: error.error.message,
            }).then(() => {
              this.isLoading = false;
            });
          }
        );
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Cannot edit e-book!',
        });
        this.isLoading = false;
        this.onCancelEditMode();
      }
    }
  }

  goToSeeFile(path: string): void {
    window.open(path, '_blank');
  }

  onEditMode() {
    this.editMode = true;
    this.initEBookCategoryData();
    this.title?.enable();
    this.author?.enable();
    this.overview?.enable();
    this.ebook_category?.enable();
    this.file_ebook?.enable();
    this.ebook_cover?.enable();
  }

  onCancelEditMode() {
    this.editMode = false;
    this.createEBookForm();
    this.initEBookDetailData();
  }
}
