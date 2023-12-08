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
  faPencil,
  faTrash,
  faRefresh,
} from '@fortawesome/free-solid-svg-icons';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Observable, Subject, filter, takeUntil, tap } from 'rxjs';
import { PaginatorRequest } from 'src/app/core/requests/paginator.request';
import { AlbumCategoryDTO } from 'src/app/core/dtos/nex-library/album-category.dto';
import { AlbumDTO } from 'src/app/core/dtos/nex-library/album.dto';
import { AlbumDataService } from 'src/app/core/services/nex-library/album-data.service';
import { AlbumCategoryDataService } from 'src/app/core/services/nex-library/album-category-data.service';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import * as moment from 'moment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { ParamsRequest } from 'src/app/core/requests/params.request';
import { Modal, initTE, Ripple } from 'tw-elements';
import { HeaderService } from 'src/app/core/services/header/header.service';
import { KeycloakService } from 'keycloak-angular';
import { SoeDTO } from 'src/app/core/soe/soe.dto';
import { NotificationRequestDTO } from 'src/app/pages/user/home-page/dtos/notification.dto';
import { SocketService } from 'src/app/core/utility/socket-io-services/socket.io.service';
import { HomePageService } from 'src/app/pages/user/home-page/homepage.service';

@Component({
  selector: 'app-photo-gallery',
  templateUrl: './photo-gallery.component.html',
  styleUrls: ['./photo-gallery.component.css'],
})
export class PhotoGalleryComponent implements OnInit, OnDestroy {
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
  faPencil = faPencil;
  faTrash = faTrash;
  faRefresh = faRefresh;

  //Album Cover File Action
  @ViewChild('albumCoverFileInput', { static: false })
  albumCoverFileInput!: ElementRef<HTMLInputElement>;
  selectedAlbumCoverFile: File | null = null;
  albumCoverFileDragging: Boolean = false;
  previewAlbumCoverImage: string | undefined;

  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  paginator?: PaginatorRequest;
  dataRequest?: ParamsRequest;

  titlePage: any;

  //Category Data
  albumCategoryData: AlbumCategoryDTO[];

  //Book Data
  albumData: AlbumDTO[];

  selectedAlbumCategory: AlbumCategoryDTO | undefined;

  //default params
  searchValue: String;
  sortBy: string;
  sortStatus: number;
  albumCategoryId?: number;
  albumCategory: string;

  pages: number[];

  isLoading: boolean;

  editAlbumForm!: FormGroup;

  albumRejectionApprovalForm!: FormGroup;

  // selected Category
  selectedDefaultCategory: AlbumCategoryDTO | undefined;

  //selected Album
  selectedAlbum: AlbumDTO | undefined;

  isRejectionChoose: boolean;

  personalNumber: string;
  user: SoeDTO | undefined;

  photoAlbumUploaders: string[];
  albumUploaders: SoeDTO[];
  albumApprovalUsers: SoeDTO[];

  SOEDefaultValue: SoeDTO | undefined;

  showTooltips: boolean[];
  tableColumnHovers: boolean[];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private readonly formBuilder: FormBuilder,
    private readonly albumDataService: AlbumDataService,
    private readonly albumCategoryDataService: AlbumCategoryDataService,
    private readonly headerService: HeaderService,
    private readonly keycloakService: KeycloakService,
    private readonly webSocket: SocketService,
    private readonly homepageService: HomePageService
  ) {
    this.initTitlePage();
    // default value
    this.albumCategoryData = [];
    this.albumData = [];
    this.searchValue = '';
    this.sortBy = 'asc';
    this.sortStatus = 0;
    this.albumCategoryId = 0;
    this.albumCategory = 'All Categories';
    this.isLoading = true;
    this.pages = [];

    this.isRejectionChoose = false;
    this.personalNumber = '';
    this.photoAlbumUploaders = [];
    this.albumUploaders = [];
    this.albumApprovalUsers = [];
    this.showTooltips = [];
    this.tableColumnHovers = new Array(14).fill(false);

    this.SOEDefaultValue = {
      personalNumber: '',
      personalName: '',
      personalTitle: '',
      personalUnit: '',
      personalBirthPlace: '',
      personalBirthDate: '',
      personalGrade: '',
      personalJobDesc: '',
      personalEmail: '',
      personalImage: '',
    };
  }

  ngOnInit() {
    initTE({ Modal, Ripple });
    this.initializeUserOptions();
    this.getUserData(this.personalNumber);
    this.createEditAlbumForm();
    this.createAlbumRejectionApprovalForm();
    this.initPaginator();
    this.initParams();

    this.initAlbumCategoryData();
    this.initAlbumData();
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
  private getUserData(
    personal_number: string,
    index?: number,
    type?: string
  ): void {
    this.headerService.getUserData(personal_number).subscribe((response) => {
      if (index !== undefined) {
        if (type === 'uploaders') {
          this.albumUploaders[index] = response.body;
        } else if (type === 'approvalUsers') {
          this.albumApprovalUsers[index] = response.body;
        }
      } else {
        this.user = response.body;
      }
    });
  }

  //Check Photo
  private checkphoto(personal_number: string, index: number): Observable<void> {
    const imageUrl = `https://talentlead.gmf-aeroasia.co.id/images/avatar/${personal_number}.jpg`;

    return new Observable<void>((observer) => {
      const img = new Image();
      img.onload = () => {
        this.photoAlbumUploaders[index] = imageUrl;
        observer.next();
        observer.complete();
      };
      img.onerror = () => {
        const defaultImageUrl =
          'https://st3.depositphotos.com/1767687/16607/v/450/depositphotos_166074422-stock-illustration-default-avatar-profile-icon-grey.jpg';

        this.photoAlbumUploaders[index] = defaultImageUrl;
        observer.next();
        observer.complete();
      };
      img.src = imageUrl;
    });
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

  initAlbumCategoryData(): void {
    this.isLoading = true;
    this.albumCategoryDataService
      .getAlbumCategoryData('page=1&limit=1000')
      .pipe(tap(), takeUntil(this._onDestroy$))
      .subscribe((response) => {
        this.albumCategoryData = response.data.data;
        this.isLoading = false;
      });
  }

  initAlbumData(): void {
    this.isLoading = true;
    let params: string = `page=${this.dataRequest?.page ?? 1}&limit=${
      this.dataRequest?.limit
    }`;

    if (this.albumCategoryId && Number(this.albumCategoryId) !== 0) {
      params += `&id_album_category=${this.albumCategoryId}`;
    }
    if (this.searchValue) {
      params += `&search=${this.searchValue}`;
    }
    if (this.sortBy) {
      params += `&sortBy=${this.sortBy}`;
    }

    this.albumDataService
      .getAlbumData(params)
      .pipe(
        tap((response) => {
          this.photoAlbumUploaders = new Array(response.data.data.length).fill(
            ''
          );
          this.albumApprovalUsers = new Array(response.data.data.length).fill(
            this.SOEDefaultValue
          );
          this.showTooltips = new Array(response.data.data.length).fill(false);
          response.data.data.forEach((element, index) => {
            this.checkphoto(element.personalNumber, index).subscribe();
            if (element.approvalBy) {
              this.getUserData(element.approvalBy, index, 'approvalUsers');
            }
            element.path =
              environment.httpUrl +
              '/v1/api/file-manager/get-imagepdf/' +
              element.path;
          });
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe((response) => {
        this.albumData = response.data.data;
        this.isLoading = false;
        if (this.paginator) {
          this.paginator.totalData = response.data.totalItems;
          this.paginator.totalPage = response.data.totalPages;
          this.pages = new Array(this.paginator.totalPage);
        }
      });
  }

  onChangeAlbumCategory(event: any): void {
    if (event) {
      this.albumCategoryId = event;
    } else {
      this.albumCategoryId = 0;
    }
    this.rePaginate();
  }

  searchByField(event: any): void {
    this.searchValue = event.target.value;
    this.rePaginate();
  }

  onChangeSortStatus(event: any): void {
    this.sortStatus = event.target.value;

    if (this.sortStatus == 1) {
      this.sortBy = 'trending';
    } else if (this.sortStatus == 2) {
      this.sortBy = 'desc';
    } else if (this.sortStatus == 3) {
      this.sortBy = 'asc';
    } else {
      //reset default
      this.sortBy = 'asc';
    }

    this.rePaginate();
  }

  initPaginator(): void {
    this.paginator = {
      pageOption: [10, 25, 50, 100],
      pageNumber: 1,
      pageSize: 10,
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

  goToPageNumberByPageSelect(event: number): void {
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
        this.paginator.pageSize = 10;
      }

      if (this.dataRequest) {
        this.dataRequest.limit = this.paginator.pageSize;
        this.dataRequest.page = this.paginator.pageNumber;
        this.dataRequest.offset =
          (this.paginator.pageNumber - 1) * this.paginator.pageSize;
      }

      this.initAlbumData();
    }
  }

  createEditAlbumForm(): void {
    this.editAlbumForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: ['', [Validators.required]],
      categoryAlbum: [null, [Validators.required]],
      image: [null, [Validators.required]],
    });
  }

  formattedUploadDate(date: string): string {
    return moment(date).format('LLL');
  }

  formattedEventDate(date: string): string {
    return moment(date).format('LL');
  }

  onGoToPhotoDetail(uuid: string): void {
    this.router.navigate([`admin/photo-gallery/${uuid}`]);
  }

  openEditorModal(selectedAlbum: AlbumDTO) {
    this.selectedAlbum = selectedAlbum;
    this.setDefaultValue(selectedAlbum);
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

  setDefaultValue(data: AlbumDTO) {
    if (this.albumCategoryData.length > 0) {
      this.selectedDefaultCategory = this.albumCategoryData.find(
        (category) => category.id === data.categoryAlbumId
      );
    }

    if (
      this.selectedDefaultCategory &&
      this.selectedDefaultCategory.name.length > 30
    ) {
      this.selectedDefaultCategory.name =
        this.selectedDefaultCategory.name.substring(0, 30) + '...';
    }

    this.editAlbumForm.patchValue({
      title: data.title,
      description: data.description,
      categoryAlbum: this.selectedDefaultCategory?.name,
    });

    this.fetchFile(data.path);
  }

  fetchFile(url: string): void {
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const fileName = url.substring(url.lastIndexOf('/') + 1);
        const fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1);

        const file = new File([blob], fileName, {
          type: `image/${fileExtension}`,
        });

        this.selectedAlbumCoverFile = file;
        this.previewAlbumCoverImage = url;
        this.editAlbumForm.controls['image'].setValue(file);
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
    this.editAlbumForm.controls['image'].markAsTouched();
  }

  triggerAlbumCoverFileInputClick(): void {
    if (this.albumCoverFileInput) {
      this.albumCoverFileInput.nativeElement.click();
      this.editAlbumForm.controls['image'].markAsTouched();
    }
  }

  onSubmit(): void {
    if (this.selectedAlbum) {
      if (this.editAlbumForm.invalid) {
        return;
      }
      const socket: NotificationRequestDTO = {
        senderPersonalNumber: this.keycloakService.getUsername(),
        receiverPersonalNumber: this.selectedAlbum.personalNumber,
        title: 'Your album has been approved',
        description: `Your album with the title ${this.selectedAlbum.title} has been approved by the admin and is now published`,
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
      formData.append(
        'categoryAlbum',
        this.categoryAlbum?.value.length > 1
          ? this.selectedDefaultCategory?.id
          : this.categoryAlbum?.value
      );
      formData.append('personalNumber', this.selectedAlbum.personalNumber);
      formData.append('upload_by', this.selectedAlbum.uploadBy);
      formData.append('unit', this.selectedAlbum.unit);

      if (this.selectedAlbum) {
        this.albumDataService
          .updateAlbumData(this.selectedAlbum.uuid, formData)
          .subscribe(
            () => {
              this.rePaginate();
              Swal.fire({
                icon: 'success',
                title: 'Great Move..',
                text: 'The Album you inputted has been edited',
              });
            },
            (error) => {
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: error.error.message,
              });
            }
          );
      }
    }
  }

  onSelectAlbum(data: AlbumDTO): void {
    this.selectedAlbum = data;
  }

  changeAlbumStatus(status: boolean): void {
    if (this.selectedAlbum) {
      this.isLoading = true;

      const request = {
        status: status,
      };

      this.albumDataService
        .updateAlbumStatus(this.selectedAlbum.uuid, request)
        .subscribe(
          (success) => {
            this.rePaginate();
            Swal.fire({
              icon: 'success',
              title: 'Great Move..',
              text: status
                ? 'The Album you selected has been activated'
                : 'The Album you selected has been deactivated',
            });
          },
          (error) => {
            this.rePaginate();
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: error.error.message,
            });
          }
        );
    }
  }

  changeAlbumStatusApproval(): void {
    if (this.selectedAlbum) {
      this.isLoading = true;

      const request = {
        approvalStatus: 'Approved',
        approvalBy: this.personalNumber,
      };
      const socket: NotificationRequestDTO = {
        senderPersonalNumber: this.keycloakService.getUsername(),
        receiverPersonalNumber: this.selectedAlbum.personalNumber,
        title: 'Your album has been approved',
        description: `Your album with the title ${this.selectedAlbum.title} has been approved by the admin and is now published`,
        isRead: 'false',
        contentType: 'album',
        contentUuid: `${this.selectedAlbum.uuid}`
      };
      this.webSocket.sendSocket(socket).subscribe(),
      this.homepageService.createNotification(socket).subscribe();
      this.albumDataService
        .updateAlbumStatusApproval(this.selectedAlbum.uuid, request)
        .subscribe(
          (success) => {
            Swal.fire({
              icon: 'success',
              title: 'Great Move..',
              text: 'The album has been approved by you',
            }).then(() => {
              this.rePaginate();
            });
          },
          (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: error.error.message,
            }).then(() => {
              this.rePaginate();
            });
          }
        );
    }
  }

  createAlbumRejectionApprovalForm(): void {
    this.albumRejectionApprovalForm = this.formBuilder.group({
      approvalStatus: ['Rejected', Validators.required],
      descStatus: ['', Validators.required],
      approvalBy: [this.personalNumber, Validators.required],
    });
  }

  get descStatus() {
    return this.albumRejectionApprovalForm.get('descStatus');
  }

  onSubmitRejectionForm(): void {
    if (!this.albumRejectionApprovalForm.valid) {
      return;
    }

    if (this.selectedAlbum) {
      this.isLoading = true;

      this.albumDataService
        .updateAlbumStatusApproval(
          this.selectedAlbum.uuid,
          this.albumRejectionApprovalForm.value
        )
        .subscribe(
          (success) => {
            Swal.fire({
              icon: 'success',
              title: 'Great Move..',
              text: 'The album has been rejected by you',
            }).then(() => {
              this.onClearForm();
            });
          },
          (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: error.error.message,
            }).then(() => {
              this.onClearForm();
            });
          }
        );
    }
  }

  onClearForm(): void {
    this.isLoading = false;
    this.isRejectionChoose = false;
    this.rePaginate();
    this.createAlbumRejectionApprovalForm();
  }

  onChooseRejection(value: boolean): void {
    this.isRejectionChoose = value;
  }
}
