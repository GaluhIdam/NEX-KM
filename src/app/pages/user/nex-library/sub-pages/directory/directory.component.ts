import { Component, OnDestroy, OnInit } from '@angular/core';
import Shepherd from 'shepherd.js';
import {
  faArrowRight,
  faBookBookmark,
  faBookOpen,
  faImage,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import { Subject, takeUntil, tap } from 'rxjs';
import { UnitDinasDTO } from 'src/app/core/dtos/nex-library/unit-dinas.dto';
import { WebDirectoryDTO } from 'src/app/core/dtos/nex-library/web-directory.dto';
import { Router } from '@angular/router';
import { UnitDinasDataService } from 'src/app/core/services/nex-library/unit-dinas-data.service';
import { WebDirectoryDataService } from 'src/app/core/services/nex-library/web-directory.service';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import * as moment from 'moment';
import { PaginatorRequest } from 'src/app/core/requests/paginator.request';
import { ParamsRequest } from 'src/app/core/requests/params.request';
import { LocalService } from 'src/app/core/services/local/local.service';
import { guideNexLibraryDirectory } from 'src/app/core/const/guide/tour-guide.const';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-directory',
  templateUrl: './directory.component.html',
  styleUrls: ['./directory.component.css'],
})
export class DirectoryComponent implements OnInit, OnDestroy {
  faChevronRight = faChevronRight;
  faBookOpen = faBookOpen;
  faImage = faImage;
  faSearch = faSearch;
  faBookBookmark = faBookBookmark;

  // tour guide
  tour = new Shepherd.Tour({
    defaultStepOptions: {
      scrollTo: { behavior: 'smooth', block: 'center' },
    },
    useModalOverlay: true,
  });

  //Bussines Unit Data
  bussinessUnitData: UnitDinasDTO[];

  //Web Directory Data
  webDirectoryData: WebDirectoryDTO[];

  selectedBussinessUnit: UnitDinasDTO | undefined;

  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  paginator?: PaginatorRequest;
  dataRequest?: ParamsRequest;

  pages: number[];

  //default params
  searchValue: String;
  sortBy: string;
  sortStatus: number;

  isCategoryLoading: boolean;
  isContentLoading: boolean;

  isWebDirectoryHover: boolean[];

  constructor(
    private readonly router: Router,
    private readonly webDirectoryDataService: WebDirectoryDataService,
    private readonly bussinessUnitDataService: UnitDinasDataService,
    private readonly localService: LocalService
  ) {
    this.bussinessUnitData = [];
    this.webDirectoryData = [];
    this.pages = [];
    this.searchValue = '';
    this.sortBy = 'asc';
    this.sortStatus = 0;
    this.isCategoryLoading = false;
    this.isContentLoading = false;
    this.isWebDirectoryHover = [];
  }

  ngOnInit(): void {
    this.initPaginator();
    this.initParams();
    this.initBussinessUnitData();
    this.tour.addStep({
      id: 'directory-step',
      title: 'Welcome To Web Directory Page',
      text: 'You saw an web directory and published it here.',
      buttons: [
        {
          text: 'SKIP',
          action: this.tour.cancel,
        },
        {
          text: 'START TOUR',
          action: this.tour.next,
        },
      ],
    });
    this.tour.addStep({
      id: 'directory-step-1',
      title: 'Bussines Unit',
      text: 'When posting a web directory, you can set the desired category for the web directory.',
      attachTo: {
        element: '.first-feature',
        on: 'right',
      },
      arrow: true,
      buttons: [
        {
          text: 'SKIP',
          action: this.tour.cancel,
          secondary: true,
        },
        {
          text: 'BACK',
          action: this.tour.back,
          secondary: true,
        },
        {
          text: 'NEXT',
          action: this.tour.next,
        },
      ],
    });
    this.tour.addStep({
      id: 'web directory-step-2',
      title: 'Manage Web Directory',
      text: 'You can manage the web directory and their posts',
      attachTo: {
        element: '.second-feature',
        on: 'right',
      },
      arrow: true,
      buttons: [
        {
          text: 'SKIP',
          action: this.tour.cancel,
          secondary: true,
        },
        {
          text: 'BACK',
          action: this.tour.back,
          secondary: true,
        },
        {
          text: 'NEXT',
          action: this.tour.next,
        },
      ],
    });
    this.tour.addStep({
      id: 'web directory-step-3',
      title: 'Publish Web Directory',
      text: 'You can publish web directory here.',
      attachTo: {
        element: '.third-feature',
        on: 'right',
      },
      arrow: true,
      buttons: [
        {
          text: 'SKIP',
          action: this.tour.cancel,
          secondary: true,
        },
        {
          text: 'BACK',
          action: this.tour.back,
          secondary: true,
        },
        {
          text: 'NEXT',
          action: this.tour.next,
        },
      ],
    });
    this.tour.on('cancel', this.onCancelTour.bind(this));
    this.tour.on('complete', this.removeTourMarkLevel.bind(this));
    if (localStorage.getItem(guideNexLibraryDirectory.MODULE)) {
    } else {
      this.tour.start();
    }
  }

  removeTourMarkLevel() {
    this.localService.removeData(guideNexLibraryDirectory.MODULE);
    this.onCancelTour();
  }

  onCancelTour() {
    this.localService.saveData(
      guideNexLibraryDirectory.MODULE,
      JSON.stringify(true)
    );
  }

  ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.unsubscribe();
  }

  initBussinessUnitData(): void {
    this.isCategoryLoading = true;
    this.bussinessUnitDataService
      .getAllUnitDinasData()
      .pipe(tap(), takeUntil(this._onDestroy$))
      .subscribe((response) => {
        this.isCategoryLoading = false;
        this.bussinessUnitData = response.data;
        if (this.selectedBussinessUnit === undefined) {
          if (this.bussinessUnitData.length > 0) {
            const selectedUnit = this.localService.getData(
              'selected_unit_dinas'
            );
            if (selectedUnit !== null) {
              this.selectedBussinessUnit = JSON.parse(selectedUnit);
            } else {
              this.selectedBussinessUnit = this.bussinessUnitData[0];
              this.localService.saveData(
                'selected_unit_dinas',
                JSON.stringify(this.selectedBussinessUnit)
              );
            }
            this.initWebDirectoryData(this.selectedBussinessUnit?.id);
          }
        }
      });
  }

  initWebDirectoryData(unitId: number | undefined): void {
    let params: string = `page=${this.dataRequest?.page ?? 1}&limit=${
      this.dataRequest?.limit
    }&status=true`;
    if (unitId) {
      params += `&id_unit=${unitId}`;
    }
    if (this.searchValue) {
      params += `&search=${this.searchValue}`;
    }
    if (this.sortBy) {
      params += `&sortBy=${this.sortBy}`;
    }

    this.isContentLoading = true;
    this.webDirectoryDataService
      .getWebDirectoryData(params)
      .pipe(
        tap((response) => {
          this.isWebDirectoryHover = new Array(response.data.data.length).fill(
            false
          );
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
        this.isContentLoading = false;
        this.webDirectoryData = response.data.data;
        if (this.paginator) {
          this.paginator.totalData = response.data.totalItems;
          this.paginator.totalPage = response.data.totalPages;
          this.pages = new Array(this.paginator.totalPage);
        }
      });
  }

  onChangeBussinessUnit(bussinessUnit: UnitDinasDTO): void {
    this.localService.saveData(
      'selected_unit_dinas',
      JSON.stringify(bussinessUnit)
    );
    this.selectedBussinessUnit = bussinessUnit;
    this.rePaginate(true);
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

  goToWebDirectoryLink(path: string): void {
    if (path.includes('http://') || path.includes('https://')) {
      window.open(path, '_blank');
    } else {
      window.open('https://' + path, '_blank');
    }
  }

  formattedDate(date: string): string {
    return moment(date).format('LLL');
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
        this.paginator.pageSize = 6;
      }

      if (this.dataRequest) {
        this.dataRequest.limit = this.paginator.pageSize;
        this.dataRequest.page = this.paginator.pageNumber;
        this.dataRequest.offset =
          (this.paginator.pageNumber - 1) * this.paginator.pageSize;
      }

      this.initWebDirectoryData(this.selectedBussinessUnit?.id);
    }
  }

  onChangeWebDirectoryHover(value: boolean, index: number) {
    this.isWebDirectoryHover[index] = value;
  }
}
