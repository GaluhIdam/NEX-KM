import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  faArrowDown,
  faArrowRight,
  faArrowUp,
  faBan,
  faBell,
  faCircleCheck,
  faEye,
  faFilter,
  faGear,
  faPrint,
  faRefresh,
  faSearch,
  faStar,
  faTrash,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import * as moment from 'moment';
import { Subject, takeUntil, tap } from 'rxjs';
import { PodcastDTO } from 'src/app/core/dtos/nex-talk/podcast.dto';
import { StatisticDTO } from 'src/app/core/dtos/nex-talk/statistic.dto';
import { PaginatorRequest } from 'src/app/core/requests/paginator.request';
import { ParamsRequest } from 'src/app/core/requests/params.request';
import { PodcastDataService } from 'src/app/core/services/nex-talk/podcast-data.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-podcast',
  templateUrl: './podcast.component.html',
  styleUrls: ['./podcast.component.css'],
})
export class PodcastComponent implements OnInit, OnDestroy {
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

  @Input() personalNumber: string;

  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  paginator?: PaginatorRequest;
  dataRequest?: ParamsRequest;

  //Podcast Data
  podcastData: PodcastDTO[];

  selectedPodcastData: PodcastDTO | undefined;

  // statistic data
  statisticData: StatisticDTO | undefined;

  rejectionApprovalForm!: FormGroup;

  //default params
  searchValue: String;
  sortBy: string;

  pages: Number[];

  isLoading: boolean;
  isStatisticLoading: boolean;

  isRejectionChoose;

  tableColumnHovers: boolean[];
  showTooltips: boolean[];

  constructor(
    private readonly router: Router,
    private readonly podcastDataService: PodcastDataService,
    private readonly formBuilder: FormBuilder
  ) {
    this.podcastData = [];
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
    this.createRejectionApprovalForm();
    this.initPaginator();
    this.initParams();
    this.initPodcastData();
    this.initStatisticData();
  }

  ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.unsubscribe();
  }

  initPodcastData(): void {
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

    this.podcastDataService
      .getPodcastData(params)
      .pipe(
        tap((response) => {
          this.showTooltips = new Array(response.data.data.length).fill(false);
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe((response) => {
        this.podcastData = response.data.data;
        this.isLoading = false;
        if (this.paginator) {
          this.paginator.totalData = response.data.totalItems;
          this.paginator.totalPage = response.data.totalPages;
          this.pages = new Array(this.paginator.totalPage);
        }
      });
  }

  initStatisticData(): void {
    this.isStatisticLoading = true;
    this.podcastDataService
      .getPodcastStatiscticData()
      .pipe(takeUntil(this._onDestroy$))
      .subscribe((response) => {
        this.statisticData = response.data;
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

      this.initPodcastData();
    }
  }

  formattedDate(date: string): string {
    return moment(date).format('LL');
  }

  onGotoPodcastDetail(uuid: string): void {
    this.router.navigate([`admin/podcast/${uuid}`]);
  }

  onSelectPodcast(data: PodcastDTO): void {
    this.selectedPodcastData = data;
  }

  changePodcastStatusApproval(): void {
    if (this.selectedPodcastData) {
      const request = {
        approvalStatus: 'Approved',
        approvalBy: this.personalNumber,
      };

      this.podcastDataService
        .updatePodcastStatusApproval(this.selectedPodcastData.uuid, request)
        .subscribe(
          (success) => {
            Swal.fire({
              icon: 'success',
              title: 'Great Move..',
              text: 'The podcast has been approved by you',
            }).then(() => {
              this.rePaginate();
              this.initStatisticData();
            });
          },
          (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: error.error.message,
            }).then(() => {
              this.rePaginate();
              this.initStatisticData();
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

    if (this.selectedPodcastData) {
      this.podcastDataService
        .updatePodcastStatusApproval(
          this.selectedPodcastData.uuid,
          this.rejectionApprovalForm.value
        )
        .subscribe(
          (success) => {
            Swal.fire({
              icon: 'success',
              title: 'Great Move..',
              text: 'The Podcast has been rejected by you',
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
    this.rePaginate();
    this.initStatisticData();
    this.createRejectionApprovalForm();
  }

  changeEditorChoiceChange(status: boolean): void {
    if (this.selectedPodcastData) {
      const request = {
        editorChoice: status,
      };
      this.podcastDataService
        .updatePodcastEditorChoice(this.selectedPodcastData.uuid, request)
        .subscribe(
          (success) => {
            Swal.fire({
              icon: 'success',
              title: 'Great Move..',
              text: status
                ? 'The Podcast you selected has been chosen'
                : 'The Podcast you have chosen has been unselected',
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

  changePodcastStatus(status: boolean): void {
    if (this.selectedPodcastData) {
      const request = {
        status: status,
      };

      this.podcastDataService
        .updatePodcastStatus(this.selectedPodcastData.uuid, request)
        .subscribe(
          (success) => {
            Swal.fire({
              icon: 'success',
              title: 'Great Move..',
              text: status
                ? 'The Podcast you selected has been activated'
                : 'The Podcast you selected has been deactivated',
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
