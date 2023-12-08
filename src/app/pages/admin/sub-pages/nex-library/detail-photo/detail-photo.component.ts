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
  faCircleCheck,
  faEye,
  faStar,
  faBan,
  faXmark,
  faTrash,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject, filter, takeUntil, tap } from 'rxjs';
import { PaginatorRequest } from 'src/app/core/requests/paginator.request';
import { AlbumGalleryDTO } from 'src/app/core/dtos/nex-library/album-gallery.dto';
import { AlbumGalleryDataService } from 'src/app/core/services/nex-library/album-gallery-data.service';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import { AlbumDataService } from 'src/app/core/services/nex-library/album-data.service';
import { AlbumDTO } from 'src/app/core/dtos/nex-library/album.dto';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ParamsRequest } from 'src/app/core/requests/params.request';
import { Modal, initTE, Ripple } from 'tw-elements';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-detail-photo',
  templateUrl: './detail-photo.component.html',
  styleUrls: ['./detail-photo.component.css'],
})
export class DetailPhotoComponent implements OnInit, OnDestroy {
  faArrowRight = faArrowRight;
  faBell = faBell;
  faGear = faGear;
  faSearch = faSearch;
  faFilter = faFilter;
  faPrint = faPrint;
  faCircleCheck = faCircleCheck;
  faEye = faEye;
  faStar = faStar;
  faBan = faBan;
  faXmark = faXmark;
  faTrash = faTrash;
  faPlus = faPlus;

  //Album Gallery Image File Action
  @ViewChild('albumGalleryImageFileInput', { static: false })
  albumGalleryImageFileInput!: ElementRef<HTMLInputElement>;
  selectedAlbumGalleryImageFile: File | null = null;
  albumGalleryImageFileDragging: Boolean = false;
  previewAlbumGalleryImage: string | undefined;

  titlePage: any;

  //uuid from URL
  uuid: string | null;

  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  paginator?: PaginatorRequest;
  dataRequest?: ParamsRequest;

  albumData: AlbumDTO | undefined;

  albumGalleryData: AlbumGalleryDTO[];

  selectedAlbumGalleryData: AlbumGalleryDTO | undefined;

  //default params
  searchValue: String;
  sortBy: string;
  sortStatus: number;

  pages: any;

  isLoading: boolean;

  isError: boolean;

  createAlbumGalleryForm!: FormGroup;

  personalNumber: string;

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly titleService: Title,
    private readonly albumDataService: AlbumDataService,
    private readonly albumGalleryDataService: AlbumGalleryDataService,
    private readonly formBuilder: FormBuilder,
    private readonly keycloakService: KeycloakService
  ) {
    this.initTitlePage();
    const requestUuid = this.activatedRoute.snapshot.paramMap.get('uuid');
    this.uuid = requestUuid;
    this.albumGalleryData = [];
    this.searchValue = '';
    this.sortBy = 'asc';
    this.sortStatus = 0;
    this.isLoading = true;
    this.isError = false;
    this.personalNumber = '';
  }

  ngOnInit() {
    initTE({ Modal, Ripple });
    this.initializeUserOptions();
    this.initCreateAlbumGalleryForm();
    this.initPaginator();
    this.initParams();

    this.initAlbumDetailData();
  }

  ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.unsubscribe();
  }

  //GET Personal Number from Keycloak
  private initializeUserOptions(): void {
    this.personalNumber = this.keycloakService.getUsername();
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

  initAlbumDetailData(): void {
    this.isLoading = true;
    this.isError = false;
    if (this.uuid) {
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
        .subscribe(
          (response) => {
            this.isLoading = false;
            this.albumData = response.data;
            this.initAlbumGalleryData(this.albumData.id);
            this.setDefaultValueForm(this.albumData.id);
          },
          () => {
            this.isLoading = false;
            this.isError = true;
          }
        );
    }
  }

  initAlbumGalleryData(albumId?: number): void {
    this.isLoading = true;
    this.isError = false;
    let params: string = `page=${this.dataRequest?.page ?? 1}&limit=${
      this.dataRequest?.limit
    }&search=${this.searchValue}&sortBy=${this.sortBy}`;

    if (albumId) {
      this.albumGalleryDataService
        .getAlbumGalleryDataPaginateByAlbumId(albumId, params)
        .pipe(
          tap((response) => {
            response.data.data.forEach((element) => {
              element.path =
                environment.httpUrl +
                '/v1/api/file-manager/get-imagepdf/' +
                element.path;
            });
          }),
          takeUntil(this._onDestroy$)
        )
        .subscribe(
          (response) => {
            this.albumGalleryData = response.data.data;
            this.isLoading = false;
            if (this.paginator) {
              this.paginator.totalData = response.data.totalItems;
              this.paginator.totalPage = response.data.totalPages;
              this.pages = new Array(this.paginator.totalPage);
            }
          },
          () => {
            this.isLoading = false;
            this.isError = true;
          }
        );
    }
  }

  initPaginator(): void {
    this.paginator = {
      pageOption: [6, 12, 24, 48],
      pageNumber: 1,
      pageSize: 6,
      totalData: 0,
      totalPage: 0,
    };
  }

  initParams(): void {
    if (this.paginator) {
      this.dataRequest = {
        limit: this.paginator.pageSize,
        page: this.paginator.pageNumber,
        offset: (this.paginator.pageNumber - 1) * this.paginator.pageSize,
      };
    }
  }

  changePageNumber(isNextPage: boolean): void {
    if (this.paginator) {
      if (isNextPage) {
        if (this.paginator) {
        }
        this.paginator.pageNumber++;
      } else {
        this.paginator.pageNumber--;
      }
    }

    this.rePaginate();
  }

  goToPageNumberByPageSelect(event: any): void {
    if (this.paginator) {
      this.paginator.pageNumber = Number(event);
      this.rePaginate();
    }
  }

  goToPageNumberByPageClick(event: any): void {
    if (this.paginator) {
      this.paginator.pageNumber = Number(event);
      this.rePaginate();
    }
  }

  changePageSize(): void {
    if (this.paginator) {
      this.paginator.pageNumber = 1;
      this.rePaginate();
    }
  }

  rePaginate(refresh?: boolean): void {
    if (this.paginator) {
      if (refresh) {
        this.paginator.pageNumber = 1;
        this.paginator.pageSize = 6;
      }

      if (this.dataRequest) {
        this.dataRequest.limit = this.paginator.pageSize;
        this.dataRequest.page = this.paginator.pageNumber;
        this.dataRequest.offset =
          (this.paginator.pageNumber - 1) * this.paginator.pageSize;
      }

      this.initAlbumGalleryData(this.albumData?.id);
    }
  }

  selectedAlbumGallery(data: AlbumGalleryDTO): void {
    this.selectedAlbumGalleryData = data;
  }

  onDeleteSelectedAlbumGallery(data?: AlbumGalleryDTO): void {
    if (data) {
      this.isLoading = true;
      const requestBody = {
        uuid: [data.uuid],
      };

      this.albumGalleryDataService
        .deleteAlbumGalleryData(requestBody)
        .subscribe(
          () => {
            this.isLoading = false;
            this.rePaginate();
            Swal.fire({
              icon: 'success',
              title: 'Delete Success',
              text: 'The photo gallery you selected has been deleted',
            });
          },
          (error) => {
            this.isLoading = false;
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: error.error.message,
            });
          }
        );
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'No data selected',
      });
    }
  }

  initCreateAlbumGalleryForm(): void {
    this.createAlbumGalleryForm = this.formBuilder.group({
      name: ['', Validators.required],
      id_album: ['', [Validators.required]],
      images: [null, [Validators.required]],
    });
  }

  setDefaultValueForm(albumId?: number): void {
    this.createAlbumGalleryForm.patchValue({
      id_album: albumId,
    });
  }

  get title() {
    return this.createAlbumGalleryForm.get('name');
  }

  get images() {
    return this.createAlbumGalleryForm.get('images');
  }

  get id_album() {
    return this.createAlbumGalleryForm.get('id_album');
  }

  get personal_number() {
    return this.createAlbumGalleryForm.get('personalNumber');
  }

  onAlbumGalleryImageDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.albumGalleryImageFileDragging = true;
  }

  onAlbumGalleryImageDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.albumGalleryImageFileDragging = false;
  }

  onAlbumGalleryImageDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.albumGalleryImageFileDragging = false;

    const file = event.dataTransfer?.files[0];
    if (file) {
      if (this.isImageFile(file)) {
        this.readAlbumGalleryImageFile(file);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Wrong File',
          text: 'Please select only image file!',
        });
      }
    }
    this.createAlbumGalleryForm.controls['images'].markAsTouched();
  }

  onAlbumGalleryImageUploaded(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (file) {
      if (this.isImageFile(file)) {
        this.readAlbumGalleryImageFile(file);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Wrong File',
          text: 'Please select only image file!',
        });
      }
    }
    this.createAlbumGalleryForm.controls['images'].markAsTouched();
    fileInput.value = '';
  }

  isImageFile(file: File): boolean {
    const acceptedImageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    return file && acceptedImageTypes.includes(file.type);
  }

  readAlbumGalleryImageFile(file: File): void {
    this.selectedAlbumGalleryImageFile = file;
    this.createAlbumGalleryForm.controls['images'].setValue(file);
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      this.previewAlbumGalleryImage = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  onRemoveAlbumGalleryImage(): void {
    this.selectedAlbumGalleryImageFile = null;
    this.previewAlbumGalleryImage = '';
    this.createAlbumGalleryForm.controls['images'].setValue(null);
    this.createAlbumGalleryForm.controls['images'].markAsTouched();
  }

  triggerAlbumGalleryImageFileInputClick(): void {
    if (this.albumGalleryImageFileInput) {
      this.albumGalleryImageFileInput.nativeElement.click();
      this.createAlbumGalleryForm.controls['images'].markAsTouched();
    }
  }

  onSubmit(): void {
    const formData = new FormData();
    formData.append('name', this.title?.value);
    formData.append('images', this.images?.value);
    formData.append('id_album', this.id_album?.value);
    formData.append('personalNumber', this.personalNumber);

    this.isLoading = true;
    this.albumGalleryDataService.storeAlbumGalleryData(formData).subscribe(
      () => {},
      (error) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: error.error.message,
        }).then(() => {
          this.onClearFormWithRefresh(false);
        });
      },
      () => {
        Swal.fire({
          icon: 'success',
          title: 'Great Move..',
          text: 'The Gallery Album you inputted has been added',
        }).then(() => {
          this.isLoading = false;
          this.onClearFormWithRefresh(true);
        });
      }
    );
  }

  onClearFormWithRefresh(refresh: boolean): void {
    if (refresh) {
      this.initAlbumGalleryData(this.albumData?.id);
    }
    this.selectedAlbumGalleryImageFile = null;
    this.initCreateAlbumGalleryForm();
    this.setDefaultValueForm(this.albumData?.id);
  }
}
