import { Component, OnDestroy, OnInit } from '@angular/core';
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
  faRefresh,
} from '@fortawesome/free-solid-svg-icons';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject, filter, takeUntil, tap } from 'rxjs';
import { EBookDataService } from 'src/app/core/services/nex-library/ebook-data.service';
import { EBookCategoryDataService } from 'src/app/core/services/nex-library/ebook-category-data.service';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import { EBookCategoryDTO } from 'src/app/core/dtos/nex-library/ebook-category.dto';
import { EBookDTO } from 'src/app/core/dtos/nex-library/ebook.dto';
import * as moment from 'moment';
import Swal from 'sweetalert2';
import { PaginatorRequest } from 'src/app/core/requests/paginator.request';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ParamsRequest } from 'src/app/core/requests/params.request';
import { Modal, initTE, Ripple } from 'tw-elements';
import { SoeDTO } from 'src/app/core/soe/soe.dto';
import { HeaderService } from 'src/app/core/services/header/header.service';
import { KeycloakService } from 'keycloak-angular';
import { NotificationRequestDTO } from 'src/app/pages/user/home-page/dtos/notification.dto';
import { SocketService } from 'src/app/core/utility/socket-io-services/socket.io.service';
import { HomePageService } from 'src/app/pages/user/home-page/homepage.service';

@Component({
  selector: 'app-ebook',
  templateUrl: './ebook.component.html',
  styleUrls: ['./ebook.component.css'],
})
export class EbookComponent implements OnInit, OnDestroy {
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
  faRefresh = faRefresh;

  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  paginator?: PaginatorRequest;
  dataRequest?: ParamsRequest;

  title: any;

  //Category Popular Data
  eBookCategoryData: EBookCategoryDTO[];

  //Book Data
  eBookData: EBookDTO[];

  selectedEBookCategory: EBookCategoryDTO | undefined;

  selectedEbook: EBookDTO | undefined;

  //default params
  searchValue: String;
  sortBy: string;
  sortStatus: number;
  ebookCategoryId?: number;
  ebookCategory: string;

  pages: number[];

  isLoading: boolean;

  //Info Current User
  personalNumber: string;
  user: SoeDTO | undefined;
  //Info Current User

  ebookRejectionApprovalForm!: FormGroup;

  ebookApprovalUsers: SoeDTO[];

  SOEDefaultValue: SoeDTO | undefined;

  isRejectionChoose: boolean;

  showTooltips: boolean[];
  tableColumnHovers: boolean[];

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly titleService: Title,
    private readonly formBuilder: FormBuilder,
    private readonly eBookDataService: EBookDataService,
    private readonly eBookCategoryDataService: EBookCategoryDataService,
    private readonly headerService: HeaderService,
    private readonly keycloakService: KeycloakService,
    private readonly webSocket: SocketService,
    private readonly homepageService: HomePageService
  ) {
    this.initTitlePage();
    // default value
    this.eBookCategoryData = [];
    this.eBookData = [];

    this.searchValue = '';
    this.sortBy = 'asc';
    this.sortStatus = 0;
    this.ebookCategoryId = 0;
    this.ebookCategory = 'All Categories';
    this.isLoading = true;
    this.pages = [];
    this.ebookApprovalUsers = [];
    this.personalNumber = '';
    this.isRejectionChoose = false;
    this.showTooltips = [];
    this.tableColumnHovers = new Array(17).fill(false);

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
    this.createEbookRejectionApprovalForm();
    this.initPaginator();
    this.initParams();

    this.initEBookCategoryData();
    this.initEBookData();
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
        this.ebookApprovalUsers[index] = response.body;
      } else {
        this.user = response.body;
      }
    });
  }

  initTitlePage(): void {
    this.activatedRoute.data.subscribe((data) => {
      this.title = data;
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

  initEBookCategoryData(): void {
    this.isLoading = true;
    this.eBookCategoryDataService
      .getEBookCategoryData('page=1&limit=1000&is_active=true')
      .pipe(tap(), takeUntil(this._onDestroy$))
      .subscribe((response) => {
        this.eBookCategoryData = response.data.data;
        this.isLoading = false;
      });
  }

  initEBookData(): void {
    this.isLoading = true;
    let params: string = `page=${this.dataRequest?.page ?? 1}&limit=${
      this.dataRequest?.limit
    }`;
    if (this.ebookCategoryId && this.ebookCategoryId !== 0) {
      params += `&id_ebook_category=${this.ebookCategoryId}`;
    }
    if (this.searchValue) {
      params += `&search=${this.searchValue}`;
    }
    if (this.sortBy) {
      params += `&sortBy=${this.sortBy}`;
    }
    this.eBookDataService
      .getEBookData(params)
      .pipe(
        tap((response) => {
          this.ebookApprovalUsers = new Array(response.data.data.length).fill(
            this.SOEDefaultValue
          );
          this.showTooltips = new Array(response.data.data.length).fill(false);
          response.data.data.forEach((element, index) => {
            if (element.approvalBy) {
              this.getUserData(element.approvalBy, index);
            }
            element.pathCover =
              environment.httpUrl +
              '/v1/api/file-manager/get-imagepdf/' +
              element.pathCover;
            element.pathEbook =
              environment.httpUrl +
              '/v1/api/file-manager/get-imagepdf/' +
              element.pathEbook;

            // calculate star rating from reviews
            let rateTotal = 0;
            let reviewsLength = element.ebooksEbookReviews.length;
            element.ebooksEbookReviews.map((review) => {
              rateTotal += review.rate;
            });
            if (rateTotal !== 0 && reviewsLength > 0) {
              element.totalRate = rateTotal / reviewsLength;
            } else {
              element.totalRate = 0;
            }
          });
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe((response) => {
        this.eBookData = response.data.data;
        this.isLoading = false;
        if (this.paginator) {
          this.paginator.totalData = response.data.totalItems;
          this.paginator.totalPage = response.data.totalPages;
          this.pages = new Array(this.paginator.totalPage);
        }
      });
  }

  onChangeEBookCategory(event: any): void {
    if (event) {
      this.ebookCategoryId = event;
    } else {
      this.ebookCategoryId = 0;
    }
    this.initEBookData();
  }

  searchByField(event: any): void {
    this.searchValue = event.target.value;
    this.initEBookData();
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

    this.initEBookData();
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
      console.log(event);
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

      this.initEBookData();
    }
  }

  onGotoBookDetail(uuid: string): void {
    this.router.navigate([`admin/ebook/${uuid}`]);
  }

  formattedDate(date: string): string {
    return moment(date).format('LLL');
  }

  onSelectEbook(data: EBookDTO): void {
    this.selectedEbook = data;
  }

  changeEbookStatus(status: boolean): void {
    if (this.selectedEbook) {
      this.isLoading = true;

      const request = {
        status: status,
      };

      this.eBookDataService
        .updateEbookStatus(this.selectedEbook.uuid, request)
        .subscribe(
          (success) => {
            this.rePaginate();
            Swal.fire({
              icon: 'success',
              title: 'Great Move..',
              text: status
                ? 'The Ebook you selected has been activated'
                : 'The Ebook you selected has been deactivated',
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

  changeEbookEditorChoiceChange(status: boolean): void {
    if (this.selectedEbook) {
      this.isLoading = true;

      const request = {
        editor_choice: status,
      };

      this.eBookDataService
        .updateEbookEditorChoice(this.selectedEbook.uuid, request)
        .subscribe(
          (success) => {
            this.rePaginate();
            Swal.fire({
              icon: 'success',
              title: 'Great Move..',
              text: status
                ? 'The Ebook you selected has been chosen'
                : 'The ebook you have chosen has been unselected',
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

  changeEbookStatusApproval(): void {
    if (this.selectedEbook) {
      this.isLoading = true;

      const request = {
        approvalStatus: 'Approved',
        approvalBy: this.personalNumber,
      };
      const socket: NotificationRequestDTO = {
        senderPersonalNumber: this.keycloakService.getUsername(),
        receiverPersonalNumber: this.selectedEbook.personalNumber,
        title: 'Your ebook has been approved',
        description: `Your ebook with the title ${this.selectedEbook.title} has been approved by the admin and is now published`,
        isRead: 'false',
        contentType: 'ebook',
        contentUuid: `${this.selectedEbook.uuid}`
      };
      this.webSocket.sendSocket(socket).subscribe(),
      this.homepageService.createNotification(socket).subscribe();
      this.eBookDataService
        .updateEbookStatusApproval(this.selectedEbook.uuid, request)
        .subscribe(
          (success) => {
            Swal.fire({
              icon: 'success',
              title: 'Great Move..',
              text: 'The ebook has been approved by you',
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

  createEbookRejectionApprovalForm(): void {
    this.ebookRejectionApprovalForm = this.formBuilder.group({
      approvalStatus: ['Rejected', Validators.required],
      descStatus: ['', Validators.required],
      approvalBy: [this.personalNumber, Validators.required],
    });
  }

  get descStatus() {
    return this.ebookRejectionApprovalForm.get('descStatus');
  }

  onSubmitRejectionForm(): void {
    if (!this.ebookRejectionApprovalForm.valid) {
      return;
    }

    if (this.selectedEbook) {
      this.isLoading = true;

      this.eBookDataService
        .updateEbookStatusApproval(
          this.selectedEbook.uuid,
          this.ebookRejectionApprovalForm.value
        )
        .subscribe(
          (success) => {
            Swal.fire({
              icon: 'success',
              title: 'Great Move..',
              text: 'The ebook has been rejected by you',
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
    this.createEbookRejectionApprovalForm();
  }

  onChooseRejection(value: boolean): void {
    this.isRejectionChoose = value;
  }
}
