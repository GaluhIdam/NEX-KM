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
import { StreamDTO } from 'src/app/core/dtos/nex-talk/stream.dto';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StreamDataService } from 'src/app/core/services/nex-talk/stream-data.service';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import * as moment from 'moment';
import Swal from 'sweetalert2';
import { StatisticDTO } from 'src/app/core/dtos/nex-talk/statistic.dto';
import { Modal, initTE, Ripple } from 'tw-elements';
import { KeycloakService } from 'keycloak-angular';
import { SocketService } from 'src/app/core/utility/socket-io-services/socket.io.service';
import { HomePageService } from 'src/app/pages/user/home-page/homepage.service';
import { NotificationRequestDTO } from 'src/app/pages/user/home-page/dtos/notification.dto';

@Component({
  selector: 'app-stream',
  templateUrl: './stream.component.html',
  styleUrls: ['./stream.component.css'],
})
export class StreamComponent implements OnInit, OnDestroy {
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

  //Stream Data
  streamData: StreamDTO[];

  selectedStreamData: StreamDTO | undefined;

  // statistic stream data
  streamStatisticData: StatisticDTO | undefined;

  rejectionApprovalForm!: FormGroup;

  //default params
  searchValue: String;
  sortBy: string;

  pages: Number[];

  isLoading: boolean;
  isStatisticLoading: boolean;

  isRejectionChoose: boolean;

  personalNumber: string;

  tableColumnHovers: boolean[];
  showTooltips: boolean[];

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly titleService: Title,
    private readonly formBuilder: FormBuilder,
    private readonly streamDataService: StreamDataService,
    private readonly keycloakService: KeycloakService,
    private readonly webSocket: SocketService,
    private readonly homepageService: HomePageService
  ) {
    this.initTitlePage();

    this.streamData = [];
    this.pages = [];
    this.isLoading = false;
    this.isStatisticLoading = false;
    this.searchValue = '';
    this.sortBy = 'asc';
    this.isRejectionChoose = false;
    this.personalNumber = '';
    this.tableColumnHovers = new Array(13).fill(false);
    this.showTooltips = [];
  }

  ngOnInit(): void {
    initTE({ Modal, Ripple });
    this.initializeUserOptions();
    this.createRejectionApprovalForm();
    this.initPaginator();
    this.initParams();
    this.initStreamData();
    this.initStreamStatisticData();
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

  initStreamData(): void {
    this.isLoading = true;
    let params: string = `page=${this.dataRequest?.page ?? 1}&limit=${
      this.dataRequest?.limit
    }`;

    if (this.searchValue) {
      params += `&search=${this.searchValue}`;
    }
    if (this.sortBy) {
      params += `&orderBy=${this.sortBy}`;
    }

    this.streamDataService
      .getStreamData(params)
      .pipe(
        tap((response) => {
          this.showTooltips = new Array(response.data.data.length).fill(false);
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe((response) => {
        this.streamData = response.data.data;
        this.isLoading = false;
        if (this.paginator) {
          this.paginator.totalData = response.data.totalItems;
          this.paginator.totalPage = response.data.totalPages;
          this.pages = new Array(this.paginator.totalPage);
        }
      });
  }

  initStreamStatisticData(): void {
    this.isStatisticLoading = true;
    this.streamDataService
      .getStreamStatiscticData()
      .pipe(takeUntil(this._onDestroy$))
      .subscribe((response) => {
        this.streamStatisticData = response.data;
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

      this.initStreamData();
    }
  }

  formattedDate(date: string): string {
    return moment(date).format('LL');
  }

  onGotoStreamDetail(uuid: string): void {
    this.router.navigate([`admin/stream/${uuid}`]);
  }

  onSelectStream(data: StreamDTO): void {
    this.selectedStreamData = data;
  }

  changeStreamStatusApproval(): void {
    if (this.selectedStreamData) {
      const request = {
        approvalStatus: 'Approved',
        approvalBy: this.personalNumber,
      };

      const socket: NotificationRequestDTO = {
        senderPersonalNumber: this.keycloakService.getUsername(),
        receiverPersonalNumber: this.selectedStreamData.personalNumber,
        title: 'Your stream has been approved',
        description: `Your stream with the title ${this.selectedStreamData.title} has been approved by the admin and is now published`,
        isRead: 'false',
        contentType: 'stream',
        contentUuid: `${this.selectedStreamData.uuid}`
      };
      this.webSocket.sendSocket(socket).subscribe(),
      this.homepageService.createNotification(socket).subscribe();

      this.streamDataService
        .updateStreamStatusApproval(this.selectedStreamData.uuid, request)
        .subscribe(
          (success) => {
            Swal.fire({
              icon: 'success',
              title: 'Great Move..',
              text: 'The Stream has been approved by you',
            }).then(() => {
              this.rePaginate();
              this.initStreamStatisticData();
            });
          },
          (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: error.error.message,
            }).then(() => {
              this.rePaginate();
              this.initStreamStatisticData();
            });
          }
        );
    }
  }

  createRejectionApprovalForm(): void {
    this.rejectionApprovalForm = this.formBuilder.nonNullable.group({
      approvalStatus: ['Rejected', Validators.required],
      approvalMessage: ['', Validators.required],
      approvalBy: [this.personalNumber, Validators.required],
    });
  }

  get approvalMessage() {
    return this.rejectionApprovalForm.get('approvalMessage');
  }

  onSubmitRejectionForm(): void {
    if (!this.rejectionApprovalForm.valid) {
      return;
    }

    if (this.selectedStreamData) {
      this.streamDataService
        .updateStreamStatusApproval(
          this.selectedStreamData.uuid,
          this.rejectionApprovalForm.value
        )
        .subscribe(
          (success) => {
            Swal.fire({
              icon: 'success',
              title: 'Great Move..',
              text: 'The Stream has been rejected by you',
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
    this.rejectionApprovalForm.reset();
    this.initStreamStatisticData();
    this.rePaginate();
  }

  changeEditorChoiceChange(status: boolean): void {
    if (this.selectedStreamData) {
      const request = {
        editorChoice: status,
      };
      this.streamDataService
        .updateStreamEditorChoice(this.selectedStreamData.uuid, request)
        .subscribe(
          (success) => {
            Swal.fire({
              icon: 'success',
              title: 'Great Move..',
              text: status
                ? 'The Podcast Stream you selected has been chosen'
                : 'The Podcast Stream you have chosen has been unselected',
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

  changeStreamStatus(status: boolean): void {
    if (this.selectedStreamData) {
      const request = {
        status: status,
      };

      this.streamDataService
        .updateStreamStatus(this.selectedStreamData.uuid, request)
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
}
