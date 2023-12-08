import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
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
  faTrash,
  faXmark,
  faBan,
  faRefresh,
  faArrowDown,
  faArrowUp,
} from '@fortawesome/free-solid-svg-icons';
import { ActivatedRoute, Data, NavigationEnd, Router } from '@angular/router';
import { Subject, filter, takeUntil, tap } from 'rxjs';
import { PaginatorRequest } from 'src/app/core/requests/paginator.request';
import { ParamsRequest } from 'src/app/core/requests/params.request';
import { ForumDTO } from 'src/app/core/dtos/nex-talk/forum.dto';
import { ForumDataService } from '../../../../../core/services/nex-talk/forum-data.service';
import * as moment from 'moment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { StatisticDTO } from 'src/app/core/dtos/nex-talk/statistic.dto';
import { Modal, initTE, Ripple } from 'tw-elements';
import { SoeDTO } from 'src/app/core/soe/soe.dto';
import { HeaderService } from 'src/app/core/services/header/header.service';
import { KeycloakService } from 'keycloak-angular';
import { NotificationRequestDTO } from 'src/app/pages/user/home-page/dtos/notification.dto';
import { SocketService } from 'src/app/core/utility/socket-io-services/socket.io.service';
import { HomePageService } from 'src/app/pages/user/home-page/homepage.service';

@Component({
  selector: 'app-forum',
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.css'],
})
export class ForumComponent implements OnInit, OnDestroy {
  faArrowRight = faArrowRight;
  faBell = faBell;
  faGear = faGear;
  faSearch = faSearch;
  faFilter = faFilter;
  faPrint = faPrint;
  faCircleCheck = faCircleCheck;
  faEye = faEye;
  faStar = faStar;
  faTrash = faTrash;
  faXmark = faXmark;
  faBan = faBan;
  faRefresh = faRefresh;
  faArrowDown = faArrowDown;
  faArrowUp = faArrowUp;

  title: Data | undefined;

  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  paginator?: PaginatorRequest;
  dataRequest?: ParamsRequest;

  // Forum Data
  forumData: ForumDTO[];

  //selected Forum
  selectedForumData: ForumDTO | undefined;

  // statistic forum data
  forumStatisticData: StatisticDTO | undefined;

  forumRejectionApprovalForm!: FormGroup;

  //default params
  searchValue: String;
  sortBy: string;
  sortStatus: number;
  forumCategoryId?: number;
  forumCategory: string;

  pages: Number[];

  isLoading: boolean;
  isStatisticLoading: boolean;

  isApprovalMessageShow: boolean;
  approvalMessageText: string;

  isRejectionChoose: boolean;

  personalNumber: string;
  user: SoeDTO | undefined;

  parsedForumDescriptions: string[];

  tableColumnHovers: boolean[];
  showTooltips: boolean[];

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly titleService: Title,
    private readonly forumDataService: ForumDataService,
    private readonly formBuilder: FormBuilder,
    private readonly headerService: HeaderService,
    private readonly keycloakService: KeycloakService,
    private readonly webSocket: SocketService,
    private readonly homepageService: HomePageService
  ) {
    this.initTitlePage();

    this.forumData = [];
    this.searchValue = '';
    this.sortBy = 'asc';
    this.sortStatus = 0;
    this.forumCategoryId = 0;
    this.forumCategory = 'All Categories';
    this.isLoading = false;
    this.isStatisticLoading = false;
    this.pages = [];
    this.isApprovalMessageShow = false;
    this.approvalMessageText = '';
    this.isRejectionChoose = false;
    this.personalNumber = '';
    this.parsedForumDescriptions = [];
    this.tableColumnHovers = new Array(12).fill(false);
    this.showTooltips = [];
  }

  ngOnInit() {
    initTE({ Modal, Ripple });
    this.initializeUserOptions();
    this.getUserData(this.personalNumber);
    this.createForumRejectionApprovalForm();
    this.initPaginator();
    this.initParams();
    this.initForumData();
    this.initForumStatisticData();
  }

  initTitlePage(): void {
    this.activatedRoute.data.pipe().subscribe((data) => {
      this.title = data;
    });
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        var rt = this.getChild(this.activatedRoute);

        rt.data.subscribe((data) => {
          this.titleService.setTitle('Nex ' + data.title);
        });
      });
  }

  getChild(activatedRoute: ActivatedRoute): ActivatedRoute {
    if (activatedRoute.firstChild) {
      return this.getChild(activatedRoute.firstChild);
    } else {
      return activatedRoute;
    }
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

  initForumData(): void {
    this.isLoading = true;
    let params: string = `page=${this.dataRequest?.page ?? 1}&limit=${
      this.dataRequest?.limit
    }`;

    if (this.forumCategoryId && Number(this.forumCategoryId) !== 0) {
      params += `&id_forum_category=${this.forumCategoryId}`;
    }
    if (this.searchValue) {
      params += `&search=${this.searchValue}`;
    }
    if (this.sortBy) {
      params += `&orderBy=${this.sortBy}`;
    }

    this.forumDataService
      .getForumData(params)
      .pipe(
        tap((response) => {
          this.parsedForumDescriptions = new Array(response.data.data.length);
          this.showTooltips = new Array(response.data.data.length).fill(false);
          response.data.data.map((dt, index) => {
            this.parsedForumDescriptions[index] = this.parseHTML(
              dt.description
            );
          });
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe((response) => {
        this.forumData = response.data.data;
        this.isLoading = false;
        if (this.paginator) {
          this.paginator.totalData = response.data.totalItems;
          this.paginator.totalPage = response.data.totalPages;
          this.pages = new Array(this.paginator.totalPage);
        }
      });
  }

  initForumStatisticData(): void {
    this.isStatisticLoading = true;
    this.forumDataService
      .getForumStatiscticData()
      .pipe(takeUntil(this._onDestroy$))
      .subscribe((response) => {
        this.forumStatisticData = response.data;
        this.isStatisticLoading = false;
      });
  }

  searchByField(event: any): void {
    this.searchValue = event.target.value;
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

      this.initForumData();
    }
  }

  formattedDate(date: string): string {
    return moment(date).format('LL');
  }

  onGotoForumDetail(uuid: string): void {
    this.router.navigate([`admin/forum/${uuid}`]);
  }

  onSelectForum(data: ForumDTO): void {
    this.selectedForumData = data;
  }

  changeForumStatusApproval(): void {
    if (this.selectedForumData) {
      const request = {
        approvalStatus: 'Approved',
        approvalBy: this.personalNumber,
      };

      const socket: NotificationRequestDTO = {
        senderPersonalNumber: this.keycloakService.getUsername(),
        receiverPersonalNumber: this.selectedForumData.personalNumber,
        title: 'Your forum has been approved',
        description: `Your forum with the title ${this.selectedForumData.title} has been approved by the admin and is now published`,
        isRead: 'false',
        contentType: 'forum',
        contentUuid: `${this.selectedForumData.uuid}`
      };
      this.webSocket.sendSocket(socket).subscribe(),
      this.homepageService.createNotification(socket).subscribe();

      this.forumDataService
        .updateForumStatusApproval(this.selectedForumData.uuid, request)
        .subscribe(
          (success) => {
            Swal.fire({
              icon: 'success',
              title: 'Great Move..',
              text: 'The forum has been approved by you',
            }).then(() => {
              this.rePaginate();
              this.initForumStatisticData();
            });
          },
          (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: error.error.message,
            }).then(() => {
              this.rePaginate();
              this.initForumStatisticData();
            });
          }
        );
    }
  }

  createForumRejectionApprovalForm(): void {
    this.forumRejectionApprovalForm = this.formBuilder.nonNullable.group({
      approvalStatus: ['Rejected', Validators.required],
      approvalMessage: ['', Validators.required],
      approvalBy: [this.personalNumber, Validators.required],
    });
  }

  get approvalMessage() {
    return this.forumRejectionApprovalForm.get('approvalMessage');
  }

  onSubmitRejectionForm(): void {
    if (!this.forumRejectionApprovalForm.valid) {
      return;
    }

    if (this.selectedForumData) {
      this.forumDataService
        .updateForumStatusApproval(
          this.selectedForumData.uuid,
          this.forumRejectionApprovalForm.value
        )
        .subscribe(
          (success) => {
            Swal.fire({
              icon: 'success',
              title: 'Great Move..',
              text: 'The Forum has been rejected by you',
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
    this.onChooseRejection(false);
    this.forumRejectionApprovalForm.reset();
    this.initForumStatisticData();
    this.rePaginate();
  }

  changeForumEditorChoiceChange(status: boolean): void {
    if (this.selectedForumData) {
      const request = {
        editorChoice: status,
      };
      this.forumDataService
        .updateForumEditorChoice(this.selectedForumData.uuid, request)
        .subscribe(
          (success) => {
            Swal.fire({
              icon: 'success',
              title: 'Great Move..',
              text: status
                ? 'The Forum you selected has been chosen'
                : 'The Forum you have chosen has been unselected',
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

  onDeleteForum(uuid: string): void {
    this.isLoading = true;
    this.forumDataService.deleteForumData(uuid).subscribe(
      (success) => {
        Swal.fire({
          icon: 'success',
          title: 'Great Move..',
          text: 'The Forum has been removed from the list',
        }).then(() => {
          this.isLoading = false;
          this.rePaginate();
        });
      },
      (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong!',
        }).then(() => {
          this.isLoading = false;
        });
      }
    );
  }

  changeForumStatus(status: boolean): void {
    if (this.selectedForumData) {
      this.isLoading = true;

      const request = {
        status: status,
      };

      this.forumDataService
        .updateForumStatus(this.selectedForumData.uuid, request)
        .subscribe(
          (success) => {
            Swal.fire({
              icon: 'success',
              title: 'Great Move..',
              text: status
                ? 'The Stream you selected has been activated'
                : 'The Stream you selected has been deactivated',
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

  onChooseRejection(value: boolean): void {
    this.isRejectionChoose = value;
  }

  parseHTML(htmlString: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    return doc.body.innerHTML;
  }
}
