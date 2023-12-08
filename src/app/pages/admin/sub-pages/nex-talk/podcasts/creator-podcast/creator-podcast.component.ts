import { Component, OnInit, OnDestroy, Input } from '@angular/core';
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
import { KeycloakService } from 'keycloak-angular';
import * as moment from 'moment';
import { Subject, takeUntil, tap } from 'rxjs';
import { CreatorDTO } from 'src/app/core/dtos/nex-talk/creator.dto';
import { StatisticDTO } from 'src/app/core/dtos/nex-talk/statistic.dto';
import { PaginatorRequest } from 'src/app/core/requests/paginator.request';
import { ParamsRequest } from 'src/app/core/requests/params.request';
import { HeaderService } from 'src/app/core/services/header/header.service';
import { CreatorDataService } from 'src/app/core/services/nex-talk/creator-data.service';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import Swal from 'sweetalert2';
import { Modal, initTE, Ripple } from 'tw-elements';

@Component({
  selector: 'app-creator-podcast',
  templateUrl: './creator-podcast.component.html',
  styleUrls: ['./creator-podcast.component.css'],
})
export class CreatorPodcastComponent implements OnInit, OnDestroy {
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

  //Creator Data
  creatorData: CreatorDTO[];

  selectedCreatorData: CreatorDTO | undefined;

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
    private readonly creatorDataService: CreatorDataService,
    private readonly formBuilder: FormBuilder
  ) {
    this.creatorData = [];
    this.pages = [];
    this.isLoading = false;
    this.isStatisticLoading = false;
    this.searchValue = '';
    this.sortBy = 'asc';
    this.isRejectionChoose = false;
    this.personalNumber = '';
    this.tableColumnHovers = new Array(19).fill(false);
    this.showTooltips = [];
  }

  ngOnInit(): void {
    initTE({ Modal, Ripple });
    this.createRejectionApprovalForm();
    this.initPaginator();
    this.initParams();
    this.initCreatorData();
    this.initStatisticData();
  }

  ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.unsubscribe();
  }

  initCreatorData(): void {
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

    this.creatorDataService
      .getCreatorData(params)
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
        this.creatorData = response.data.data;
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
    this.creatorDataService
      .getCreatorStatiscticData()
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

      this.initCreatorData();
    }
  }

  formattedDate(date: string): string {
    return moment(date).format('LL');
  }

  onGotoCreatorDetail(uuid: string): void {
    this.router.navigate([`admin/creator/${uuid}`]);
  }

  onSelectCreator(data: CreatorDTO): void {
    this.selectedCreatorData = data;
  }

  changeCreatorStatusApproval(): void {
    if (this.selectedCreatorData) {
      const request = {
        approvalStatus: 'Approved',
        approvalBy: this.personalNumber,
      };

      this.creatorDataService
        .updateCreatorStatusApproval(this.selectedCreatorData.uuid, request)
        .subscribe(
          (success) => {
            Swal.fire({
              icon: 'success',
              title: 'Great Move..',
              text: 'The podcast creator has been approved by you',
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
    this.rejectionApprovalForm = this.formBuilder.group({
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

    if (this.selectedCreatorData) {
      this.creatorDataService
        .updateCreatorStatusApproval(
          this.selectedCreatorData.uuid,
          this.rejectionApprovalForm.value
        )
        .subscribe(
          (success) => {
            Swal.fire({
              icon: 'success',
              title: 'Great Move..',
              text: 'The podcast creator has been rejected by you',
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
    if (this.selectedCreatorData) {
      const request = {
        editorChoice: status,
      };
      this.creatorDataService
        .updateCreatorEditorChoice(this.selectedCreatorData.uuid, request)
        .subscribe(
          (success) => {
            Swal.fire({
              icon: 'success',
              title: 'Great Move..',
              text: status
                ? 'The Podcast creator you selected has been chosen'
                : 'The Podcast creator you have chosen has been unselected',
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

  changeCreatorStatus(status: boolean): void {
    if (this.selectedCreatorData) {
      const request = {
        status: status,
      };

      this.creatorDataService
        .updateCreatorStatus(this.selectedCreatorData.uuid, request)
        .subscribe(
          (success) => {
            Swal.fire({
              icon: 'success',
              title: 'Great Move..',
              text: status
                ? 'The Podcast Creator you selected has been activated'
                : 'The Podcast Creator you selected has been deactivated',
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

  calculatePublishedSerie(creator: CreatorDTO): number {
    return creator.series.filter(
      (serie) => serie.approvalStatus.toLowerCase() === 'approved'
    ).length;
  }

  calculateNeedApprovalSerie(creator: CreatorDTO): number {
    return creator.series.filter(
      (serie) =>
        serie.approvalStatus.toLowerCase() !== 'approved' &&
        serie.approvalStatus.toLowerCase() !== 'rejected'
    ).length;
  }

  calculateCreationPodcast(creator: CreatorDTO): number {
    let count = 0;

    creator.series.map((serie) => {
      count += serie.seriesPodcast.length;
    });

    return count;
  }

  calculatePublishedPodcast(creator: CreatorDTO): number {
    let count = 0;

    creator.series.map((serie) => {
      serie.seriesPodcast.map((podcast) => {
        if (podcast.approvalStatus === 'approved') {
          count += 1;
        }
      });
    });

    return count;
  }

  calculateNeedApprovalPodcast(creator: CreatorDTO): number {
    let count = 0;

    creator.series.map((serie) => {
      serie.seriesPodcast.map((podcast) => {
        if (
          podcast.approvalStatus !== 'approved' &&
          podcast.approvalStatus !== 'rejected'
        ) {
          count += 1;
        }
      });
    });

    return count;
  }

  calculateLikesPodcast(creator: CreatorDTO): number {
    let count = 0;

    creator.series.map((serie) => {
      serie.seriesPodcast.map((podcast) => {
        count += podcast.likeCount;
      });
    });

    return count;
  }

  onChooseRejection(value: boolean): void {
    this.isRejectionChoose = value;
  }
}
