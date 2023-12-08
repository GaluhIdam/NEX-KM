import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { faArrowRight, faBell, faGear, faSearch, faFilter, faPrint, faCircleCheck, faEye, faStar, faBan, faXmark, faPencil, faPlus, faTrash, faTimes, faEdit, faRecycle } from '@fortawesome/free-solid-svg-icons';
import { KeycloakService } from 'keycloak-angular';
import { Observable, Subject, filter, takeUntil, tap } from 'rxjs';
import { ReportDTO } from 'src/app/core/dtos/homepage/report';
import { PaginatorRequest } from 'src/app/core/requests/paginator.request';
import { ParamsRequest } from 'src/app/core/requests/params.request';
import { HeaderService } from 'src/app/core/services/header/header.service';
import { ReportService } from 'src/app/core/services/homepage/report.service';
import { SoeDTO } from 'src/app/core/soe/soe.dto';
import { environment } from 'src/environments/environment.prod';
import Swal from 'sweetalert2';
import { Modal, initTE, Ripple } from 'tw-elements';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent {
  faArrowRight = faArrowRight
  faBell = faBell
  faGear = faGear
  faSearch = faSearch
  faFilter = faFilter
  faPrint = faPrint
  faCircleCheck = faCircleCheck
  faEye = faEye
  faStar = faStar
  faBan = faBan
  faXmark = faXmark
  faPencil = faPencil
  faPlus = faPlus
  faTrash = faTrash
  faTimes = faTimes
  faEdit = faEdit
  faRecycle = faRecycle


  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  paginator?: PaginatorRequest;
  dataRequest?: ParamsRequest;

  titlePage: any;

  // merchandise directory data
  ReportData: ReportDTO[];

  selectedReport: ReportDTO | undefined;

  //default params
  searchValue: String;
  sortBy: string;
  sortStatus: number;

  pages: any;

  isLoading: boolean;

  ReportForm!: FormGroup;

  personalNumber: string;
  user: SoeDTO | undefined;

  personalName: string

  photoReportDirectoryUploaders: string[];
  ReportDirectoryUploaders: SoeDTO[];

  SOEDefaultValue: SoeDTO | undefined;

  editMode: boolean;

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly titleService: Title,
    private readonly formBuilder: FormBuilder,
    private readonly ReportService: ReportService,
    private readonly headerService: HeaderService,
    private readonly keycloakService: KeycloakService
  ) {
    this.initTitlePage();
    // default value
    this.ReportData = [];
    this.searchValue = '';
    this.sortBy = 'asc';
    this.sortStatus = 0;
    this.isLoading = false;
    this.photoReportDirectoryUploaders = [];
    this.ReportDirectoryUploaders = [];
    this.personalNumber = '';
    this.personalName = '';
    this.editMode = false;

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
    this.createReportForm();
    this.initPaginator();
    this.initParams();
    this.initReportDirectoryData();
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
        this.ReportDirectoryUploaders[index] = response.body;
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
        this.photoReportDirectoryUploaders[index] = imageUrl;
        observer.next();
        observer.complete();
      };
      img.onerror = () => {
        const defaultImageUrl =
          'https://st3.depositphotos.com/1767687/16607/v/450/depositphotos_166074422-stock-illustration-default-avatar-profile-icon-grey.jpg';

        this.photoReportDirectoryUploaders[index] = defaultImageUrl;
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

  initReportDirectoryData(): void {
    this.isLoading = true;

    let params: string = `page=${this.dataRequest?.page ?? 1}&limit=${
      this.dataRequest?.limit
    }`;

    if (this.searchValue) {
      params += `&search=${this.searchValue}`;
    }
    if (this.sortBy) {
      params += `&sortBy=${this.sortBy}`;
    }

    this.ReportService
      .getReportData(params)
      .pipe(
        tap((response) => {
          this.photoReportDirectoryUploaders = new Array(
            response.data.data.length
          ).fill('');
          this.ReportDirectoryUploaders = new Array(
            response.data.data.length
          ).fill(this.SOEDefaultValue);

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
        this.ReportData = response.data.data;
        this.isLoading = false;
        if (this.paginator) {
          this.paginator.totalData = response.data.totalItems;
          this.paginator.totalPage = response.data.totalPages;
          this.pages = new Array(this.paginator.totalPage);
        }
      },
      ()=>{
        this.isLoading = false;
        this.ReportData = []
      });
  }

  searchByField(event: any): void {
    this.searchValue = event.target.value;
    this.initReportDirectoryData();
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

      this.initReportDirectoryData();
    }
  }

  goToReportDirectoryLink(path: string): void {
    window.open('https://' + path, '_blank');
  }

  createReportForm(): void {
    this.ReportForm = this.formBuilder.group({
      name: ['', Validators.required],
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      date: ['', [Validators.required]],
    });
  }

  openEditorModal(selectedDirectory: ReportDTO) {
    this.selectedReport = selectedDirectory;
    this.setDefaultValue(selectedDirectory);
  }

  get name() {
    return this.ReportForm.get('name');
  }

  get unit() {
    return this.ReportForm.get('unit');
  }

  get email() {
    return this.ReportForm.get('email');
  }

  get report_status() {
    return this.ReportForm.get('report_status');
  }

  get report_overview() {
    return this.ReportForm.get('report_overview');
  }

  setDefaultValue(data: ReportDTO) {
    this.ReportForm.patchValue({
      name: data.name,
      unit: data.unit,
      email: data.email,
      report_status: data.report_status,
      report_overview: data.report_overview,
    });
  }

  onSubmit() {
    if (this.ReportForm.invalid) {
      return;
    }

    const formData = new FormData();
    formData.append('name', this.name?.value);
    formData.append('unit', this.unit?.value);
    formData.append('email', this.email?.value);
    formData.append('report_status', this.report_status?.value);
    formData.append('report_overview', this.report_overview?.value);
  }

  onStoreReportService(formData: FormData): void {
    this.ReportService.storeReportData(formData).subscribe(
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
          text: 'The Merchandise Directory you inputed has been added',
        }).then(() => {
          this.onClearForm();
        });
      }
    );
  }

  onUpdateReportService(uuid: string, formData: FormData): void {
    this.ReportService
      .updateReportData(uuid, formData)
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
            text: 'The Merchandise you inputed has been edited',
          }).then(() => {
            this.onClearForm();
          });
        }
      );
  }

  onClearForm(): void {
    this.rePaginate();
    this.createReportForm();
  }

  onSelectReportDirectory(data: ReportDTO): void {
    this.selectedReport = data;
  }

  changeReportDirectoryStatus(status: boolean): void {
    if (this.selectedReport) {
      this.isLoading = true;

      const request = {
        status: status,
      };

      this.ReportService
        .updateReportDataStatus(this.selectedReport.uuid, request)
        .subscribe(
          (success) => {

            Swal.fire({
              icon: 'success',
              title: 'Great Move..',
              text: status
                ? 'The Merchandise Directory you selected has been activated'
                : 'The Merchandise Directory you selected has been deactivated',
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
  }

  onClickCancel(): void {
    this.createReportForm();
  }
}
