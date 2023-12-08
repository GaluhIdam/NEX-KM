import { HomePageService } from 'src/app/pages/user/home-page/homepage.service';
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
  faPlus,
  faTrash,
  faRefresh,
} from '@fortawesome/free-solid-svg-icons';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Observable, Subject, filter, takeUntil, tap } from 'rxjs';
import { PaginatorRequest } from 'src/app/core/requests/paginator.request';
import { UnitDinasDTO } from 'src/app/core/dtos/nex-library/unit-dinas.dto';
import { WebDirectoryDTO } from 'src/app/core/dtos/nex-library/web-directory.dto';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WebDirectoryDataService } from 'src/app/core/services/nex-library/web-directory.service';
import { UnitDinasDataService } from 'src/app/core/services/nex-library/unit-dinas-data.service';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import Swal from 'sweetalert2';
import { ParamsRequest } from 'src/app/core/requests/params.request';
import { Modal, initTE, Ripple } from 'tw-elements';
import { HeaderService } from 'src/app/core/services/header/header.service';
import { KeycloakService } from 'keycloak-angular';
import { SoeDTO } from 'src/app/core/soe/soe.dto';
import { NotificationRequestDTO } from 'src/app/pages/user/home-page/dtos/notification.dto';
import { SocketService } from 'src/app/core/utility/socket-io-services/socket.io.service';

@Component({
  selector: 'app-web-directory',
  templateUrl: './web-directory.component.html',
  styleUrls: ['./web-directory.component.css'],
})
export class WebDirectoryComponent implements OnInit, OnDestroy {
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
  faPlus = faPlus;
  faTrash = faTrash;
  faRefresh = faRefresh;

  //Directory Cover File Action
  @ViewChild('directoryCoverFileInput', { static: false })
  directoryCoverFileInput!: ElementRef<HTMLInputElement>;
  selectedDirectoryCoverFile: File | null = null;
  directoryCoverFileDragging: Boolean = false;
  previewDirectoryCoverImage: string | undefined;

  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  paginator?: PaginatorRequest;
  dataRequest?: ParamsRequest;

  titlePage: any;

  //unit data
  unitData: UnitDinasDTO[];

  selectedUnitData: UnitDinasDTO | undefined;

  // web directory data
  webDirectoryData: WebDirectoryDTO[];

  selectedWebDirectory: WebDirectoryDTO | undefined;

  //default params
  searchValue: String;
  sortBy: string;
  sortStatus: number;
  unitId?: number;
  unit: string;

  pages: any;

  isLoading: boolean;

  webDirectoryForm!: FormGroup;

  personalNumber: string;
  user: SoeDTO | undefined;

  photoWebDirectoryUploaders: string[];
  webDirectoryUploaders: SoeDTO[];

  SOEDefaultValue: SoeDTO | undefined;

  editMode: boolean;

  showTooltips: boolean[];
  tableColumnHovers: boolean[];

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly titleService: Title,
    private readonly formBuilder: FormBuilder,
    private readonly webDirectoryDataService: WebDirectoryDataService,
    private readonly unitDinasDataService: UnitDinasDataService,
    private readonly headerService: HeaderService,
    private readonly keycloakService: KeycloakService,
    private readonly webSocket: SocketService,
    private readonly homepageService: HomePageService
  ) {
    this.initTitlePage();
    // default value
    this.unitData = [];
    this.webDirectoryData = [];

    this.searchValue = '';
    this.sortBy = 'asc';
    this.sortStatus = 0;
    this.unitId = 0;
    this.unit = 'All Units';
    this.isLoading = true;
    this.photoWebDirectoryUploaders = [];
    this.webDirectoryUploaders = [];
    this.personalNumber = '';
    this.editMode = false;
    this.showTooltips = [];
    this.tableColumnHovers = new Array(7).fill(false);

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
    this.createWebDirectoryForm();
    this.initPaginator();
    this.initParams();
    this.initUnitData();
    this.initWebDirectoryData();
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
  private getUserData(personal_number: string, index?: number): void {
    this.headerService.getUserData(personal_number).subscribe((response) => {
      if (index !== undefined) {
        this.webDirectoryUploaders[index] = response.body;
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
        this.photoWebDirectoryUploaders[index] = imageUrl;
        observer.next();
        observer.complete();
      };
      img.onerror = () => {
        const defaultImageUrl =
          'https://st3.depositphotos.com/1767687/16607/v/450/depositphotos_166074422-stock-illustration-default-avatar-profile-icon-grey.jpg';

        this.photoWebDirectoryUploaders[index] = defaultImageUrl;
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

  initUnitData(): void {
    this.isLoading = true;
    this.unitDinasDataService
      .getAllUnitDinasData()
      .pipe(tap(), takeUntil(this._onDestroy$))
      .subscribe((response) => {
        this.unitData = response.data;
        this.isLoading = false;
      });
  }

  initWebDirectoryData(): void {
    this.isLoading = true;

    let params: string = `page=${this.dataRequest?.page ?? 1}&limit=${
      this.dataRequest?.limit
    }`;

    if (this.unitId && Number(this.unitId) !== 0) {
      params += `&id_unit=${this.unitId}`;
    }
    if (this.searchValue) {
      params += `&search=${this.searchValue}`;
    }
    if (this.sortBy) {
      params += `&sortBy=${this.sortBy}`;
    }

    this.webDirectoryDataService
      .getWebDirectoryData(params)
      .pipe(
        tap((response) => {
          this.photoWebDirectoryUploaders = new Array(
            response.data.data.length
          ).fill('');
          this.webDirectoryUploaders = new Array(
            response.data.data.length
          ).fill(this.SOEDefaultValue);
          this.showTooltips = new Array(response.data.data.length).fill(false);

          response.data.data.forEach((element, index) => {
            this.checkphoto(element.personalNumber, index).subscribe();
            this.getUserData(element.personalNumber, index);
            element.path =
              environment.httpUrl +
              '/v1/api/file-manager/get-imagepdf/' +
              element.path;
          });
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe((response) => {
        this.webDirectoryData = response.data.data;
        this.isLoading = false;
        if (this.paginator) {
          this.paginator.totalData = response.data.totalItems;
          this.paginator.totalPage = response.data.totalPages;
          this.pages = new Array(this.paginator.totalPage);
        }
      });
  }

  onChangeUnit(event: any): void {
    if (event) {
      this.unitId = event;
    } else {
      this.unitId = 0;
    }
    this.initWebDirectoryData();
  }

  searchByField(event: any): void {
    this.searchValue = event.target.value;
    this.initWebDirectoryData();
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
        this.paginator.pageSize = 10;
      }

      if (this.dataRequest) {
        this.dataRequest.limit = this.paginator.pageSize;
        this.dataRequest.page = this.paginator.pageNumber;
        this.dataRequest.offset =
          (this.paginator.pageNumber - 1) * this.paginator.pageSize;
      }

      this.initWebDirectoryData();
    }
  }

  goToWebDirectoryLink(path: string): void {
    if (path.includes('http://') || path.includes('https://')) {
      window.open(path, '_blank');
    } else {
      window.open('https://' + path, '_blank');
    }
  }

  createWebDirectoryForm(): void {
    this.webDirectoryForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: ['', [Validators.required]],
      link: ['', [Validators.required]],
      id_unit_dinas: [null, [Validators.required]],
      cover_image: [null, [Validators.required]],
    });
  }

  openEditorModal(selectedDirectory: WebDirectoryDTO) {
    this.selectedWebDirectory = selectedDirectory;
    this.setDefaultValue(selectedDirectory);
  }

  get title() {
    return this.webDirectoryForm.get('title');
  }

  get description() {
    return this.webDirectoryForm.get('description');
  }

  get link() {
    return this.webDirectoryForm.get('link');
  }

  get id_unit_dinas() {
    return this.webDirectoryForm.get('id_unit_dinas');
  }

  get cover_image() {
    return this.webDirectoryForm.get('cover_image');
  }

  setDefaultValue(data: WebDirectoryDTO) {
    if (this.unitData.length > 0) {
      this.selectedUnitData = this.unitData.find(
        (unit) => unit.id === data.dinasId
      );
    }

    this.webDirectoryForm.patchValue({
      title: data.title,
      description: data.description,
      link: data.link,
      id_unit_dinas: this.selectedUnitData?.name,
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

        this.selectedDirectoryCoverFile = file;
        this.previewDirectoryCoverImage = url;
        this.webDirectoryForm.controls['cover_image'].setValue(file);
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
    this.webDirectoryForm.controls['cover_image'].markAsTouched();
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
    this.webDirectoryForm.controls['cover_image'].markAsTouched();
    fileInput.value = '';
  }

  isImageFile(file: File): boolean {
    const acceptedImageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    return file && acceptedImageTypes.includes(file.type);
  }

  readDirectoryCoverFile(file: File): void {
    this.selectedDirectoryCoverFile = file;
    this.webDirectoryForm.controls['cover_image'].setValue(file);
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      this.previewDirectoryCoverImage = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  onRemoveDirectoryCover(): void {
    this.selectedDirectoryCoverFile = null;
    this.previewDirectoryCoverImage = '';
    this.webDirectoryForm.controls['cover_image'].setValue(null);
    this.webDirectoryForm.controls['cover_image'].markAsTouched();
  }

  triggerDirectoryCoverFileInputClick(): void {
    if (this.directoryCoverFileInput) {
      this.directoryCoverFileInput.nativeElement.click();
      this.webDirectoryForm.controls['cover_image'].markAsTouched();
    }
  }

  onSubmit() {
    if (this.webDirectoryForm.invalid) {
      return;
    }

    // const socket: NotificationRequestDTO = {
    //   senderPersonalNumber: this.keycloakService.getUsername(),
    //   receiverPersonalNumber: '582127',
    //   title: 'Create Web Directory',
    //   description: 'Web Directory has been created',
    //   isRead: 'false'
    // }
    // this.webSocket.sendSocket(socket).subscribe(),
    // this.homepageService.createNotification(socket).subscribe()

    const formData = new FormData();
    formData.append('cover_image', this.cover_image?.value);
    formData.append('title', this.title?.value);
    formData.append('description', this.description?.value);
    formData.append('link', this.link?.value);
    formData.append('personalNumber', this.personalNumber);

    if (this.editMode) {
      //state for edit selected web directory
      if (this.selectedWebDirectory) {
        formData.append(
          'id_unit_dinas',
          this.id_unit_dinas?.value.length > 1
            ? this.selectedUnitData?.id
            : this.id_unit_dinas?.value
        );
        this.onUpdateWebService(this.selectedWebDirectory.uuid, formData);
      }
    } else {
      // state for add new web directory
      formData.append('id_unit_dinas', this.id_unit_dinas?.value);
      this.onStoreWebService(formData);
    }
  }

  onStoreWebService(formData: FormData): void {
    this.webDirectoryDataService.storeWebDirectoryData(formData).subscribe(
      () => {},
      (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: error.error.message,
        }).then(() => {
          this.onClearForm();
        });
      },
      () => {
        Swal.fire({
          icon: 'success',
          title: 'Great Move..',
          text: 'The Web Directory you inputed has been added',
        }).then(() => {
          this.onClearForm();
        });
      }
    );
  }

  onUpdateWebService(uuid: string, formData: FormData): void {
    this.webDirectoryDataService
      .updateWebDirectoryData(uuid, formData)
      .subscribe(
        () => {},
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: error.error.message,
          }).then(() => {
            this.onClearForm();
          });
        },
        () => {
          Swal.fire({
            icon: 'success',
            title: 'Great Move..',
            text: 'The Website you inputed has been edited',
          }).then(() => {
            this.onClearForm();
          });
        }
      );
  }

  onClearForm(): void {
    this.rePaginate();
    this.selectedDirectoryCoverFile = null;
    this.createWebDirectoryForm();
  }

  onSelectWebDirectory(data: WebDirectoryDTO): void {
    this.selectedWebDirectory = data;
  }

  changeWebDirectoryStatus(status: boolean): void {
    if (this.selectedWebDirectory) {
      this.isLoading = true;

      const request = {
        status: status,
      };

      this.webDirectoryDataService
        .updateWebDirectoryStatus(this.selectedWebDirectory.uuid, request)
        .subscribe(
          (success) => {
            Swal.fire({
              icon: 'success',
              title: 'Great Move..',
              text: status
                ? 'The Web Directory you selected has been activated'
                : 'The Web Directory you selected has been deactivated',
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

  onChangeEditMode(value: boolean): void {
    this.editMode = value;
    if (!value) {
      this.onClickCancel();
    }
  }

  onClickCancel(): void {
    this.selectedDirectoryCoverFile = null;
    this.createWebDirectoryForm();
  }
}
