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
import { SerieDTO } from 'src/app/core/dtos/nex-talk/serie.dto';
import { StatisticDTO } from 'src/app/core/dtos/nex-talk/statistic.dto';
import { PaginatorRequest } from 'src/app/core/requests/paginator.request';
import { ParamsRequest } from 'src/app/core/requests/params.request';
import { SerieDataService } from 'src/app/core/services/nex-talk/serie-data.service';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-series-podcast',
  templateUrl: './series-podcast.component.html',
  styleUrls: ['./series-podcast.component.css'],
})
export class SeriesPodcastComponent implements OnInit, OnDestroy {
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

  //Serie Data
  serieData: SerieDTO[];

  selectedSerieData: SerieDTO | undefined;

  // statistic data
  statisticData: StatisticDTO | undefined;

  rejectionApprovalForm!: FormGroup;

  //default params
  searchValue: String;
  sortBy: string;

  pages: Number[];

  isLoading: boolean;
  isStatisticLoading: boolean;

  isRejectionChoose: boolean;

  tableColumnHovers: boolean[];
  showTooltips: boolean[];

  constructor(
    private readonly router: Router,
    private readonly serieDataService: SerieDataService,
    private readonly formBuilder: FormBuilder
  ) {
    this.serieData = [];
    this.pages = [];
    this.isLoading = false;
    this.isStatisticLoading = false;
    this.searchValue = '';
    this.sortBy = 'asc';
    this.personalNumber = '';
    this.isRejectionChoose = false;
    this.tableColumnHovers = new Array(19).fill(false);
    this.showTooltips = [];
  }

  ngOnInit(): void {
    this.createRejectionApprovalForm();
    this.initPaginator();
    this.initParams();
    this.initSerieData();
    this.initStatisticData();
  }

  ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.unsubscribe();
  }

  initSerieData(): void {
    this.isLoading = true;
    let params: string = `page=${this.dataRequest?.page ?? 1}&limit=${
      this.dataRequest?.limit
    }`;

    if (this.searchValue) {
      params += `&search=${this.searchValue}`;
    }
    if (this.sortBy) {
      params += `&order_by=${this.sortBy}`;
    }

    this.serieDataService
      .getSerieData(params)
      .pipe(
        tap((response) => {
          this.showTooltips = new Array(response.data.data.length).fill(false);
          response.data.data.forEach((element) => {
            element.path =
              environment.httpUrl +
              '/v1/api/file-manager/get-imagepdf/' +
              element.path;
          });
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe((response) => {
        this.serieData = response.data.data;
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
    this.serieDataService
      .getSerieStatiscticData()
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

      this.initSerieData();
    }
  }

  formattedDate(date: string): string {
    return moment(date).format('LL');
  }

  onGotoSerieDetail(uuid: string): void {
    this.router.navigate([`admin/serie/${uuid}`]);
  }

  onSelectSerie(data: SerieDTO): void {
    this.selectedSerieData = data;
  }

  changeSerieStatusApproval(): void {
    if (this.selectedSerieData) {
      const request = {
        approvalStatus: 'Approved',
        approvalBy: this.personalNumber,
      };

      this.serieDataService
        .updateSerieStatusApproval(this.selectedSerieData.uuid, request)
        .subscribe(
          (success) => {
            Swal.fire({
              icon: 'success',
              title: 'Great Move..',
              text: 'The podcast serie has been approved by you',
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

    if (this.selectedSerieData) {
      this.serieDataService
        .updateSerieStatusApproval(
          this.selectedSerieData.uuid,
          this.rejectionApprovalForm.value
        )
        .subscribe(
          (success) => {
            Swal.fire({
              icon: 'success',
              title: 'Great Move..',
              text: 'The podcast serie has been rejected by you',
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
    this.initStatisticData();
    this.rePaginate();
  }

  changeEditorChoiceChange(status: boolean): void {
    if (this.selectedSerieData) {
      const request = {
        editorChoice: status,
      };
      this.serieDataService
        .updateSerieEditorChoice(this.selectedSerieData.uuid, request)
        .subscribe(
          (success) => {
            Swal.fire({
              icon: 'success',
              title: 'Great Move..',
              text: status
                ? 'The Podcast serie you selected has been chosen'
                : 'The Podcast serie you have chosen has been unselected',
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

  changeSerieStatus(status: boolean): void {
    if (this.selectedSerieData) {
      const request = {
        status: status,
      };

      this.serieDataService
        .updateSerieStatus(this.selectedSerieData.uuid, request)
        .subscribe(
          (success) => {
            Swal.fire({
              icon: 'success',
              title: 'Great Move..',
              text: status
                ? 'The Podcast serie you selected has been activated'
                : 'The Podcast serie you selected has been deactivated',
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

  calculatePublishedPodcast(serie: SerieDTO): number {
    return serie.seriesPodcast.filter(
      (podcast) => podcast.approvalStatus.toLowerCase() === 'approved'
    ).length;
  }

  calculateLikesPodcast(serie: SerieDTO): number {
    let count = 0;

    serie.seriesPodcast.map((podcast) => {
      count += podcast.likeCount;
    });

    return count;
  }

  onChooseRejection(value: boolean): void {
    this.isRejectionChoose = value;
  }
}
