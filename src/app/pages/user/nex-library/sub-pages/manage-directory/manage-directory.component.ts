import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  faArrowRight,
  faBars,
  faBookBookmark,
  faBookOpen,
  faImage,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import { KeycloakService } from 'keycloak-angular';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil, tap } from 'rxjs';
import { UnitDinasDTO } from 'src/app/core/dtos/nex-library/unit-dinas.dto';
import { WebDirectoryDTO } from 'src/app/core/dtos/nex-library/web-directory.dto';
import { PaginatorRequest } from 'src/app/core/requests/paginator.request';
import { ParamsRequest } from 'src/app/core/requests/params.request';
import { LocalService } from 'src/app/core/services/local/local.service';
import { UnitDinasDataService } from 'src/app/core/services/nex-library/unit-dinas-data.service';
import { WebDirectoryDataService } from 'src/app/core/services/nex-library/web-directory.service';
import { environment } from 'src/environments/environment.prod';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-manage-directory',
  templateUrl: './manage-directory.component.html',
  styleUrls: ['./manage-directory.component.css'],
})
export class ManageDirectoryComponent implements OnInit, OnDestroy {
  faChevronRight = faChevronRight;
  faBookOpen = faBookOpen;
  faImage = faImage;
  faSearch = faSearch;
  faBookBookmark = faBookBookmark;
  faBars = faBars;

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

  personalNumber: string;

  constructor(
    private readonly router: Router,
    private readonly webDirectoryDataService: WebDirectoryDataService,
    private readonly bussinessUnitDataService: UnitDinasDataService,
    private readonly toastr: ToastrService,
    private readonly keycloakService: KeycloakService,
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
    this.personalNumber = '';
  }

  ngOnInit(): void {
    this.initializeUserOptions();
    this.initPaginator();
    this.initParams();
    this.initBussinessUnitData();
  }

  ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.unsubscribe();
  }

  //GET Personal Number from Keycloak
  private initializeUserOptions(): void {
    this.personalNumber = this.keycloakService.getUsername();
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
    }`;
    if (unitId) {
      params += `&id_unit=${unitId}`;
    }
    if (this.searchValue) {
      params += `&search=${this.searchValue}`;
    }
    if (this.sortBy) {
      params += `&sortBy=${this.sortBy}`;
    }
    if (this.personalNumber) {
      params += `&personalNumber=${this.personalNumber}`;
    }

    this.isContentLoading = true;
    this.webDirectoryDataService
      .getWebDirectoryData(params)
      .pipe(
        tap((response) => {
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

  onGoToEditDirectory(uuid: string): void {
    this.localService.saveData(
      'selected_unit_dinas',
      JSON.stringify(this.selectedBussinessUnit)
    );
    this.router.navigate(['/user/nex-library/directory-edit/' + uuid]);
  }

  onChangeDirectoryStatus(status: boolean, uuid: string): void {
    const request = {
      status: status,
    };

    this.webDirectoryDataService
      .updateWebDirectoryStatus(uuid, request)
      .subscribe(
        (success) => {
          this.initWebDirectoryData(this.selectedBussinessUnit?.id);
          this.toastr.success(
            status
              ? 'The web directory you selected has been activated'
              : 'The web directory you selected has been deactivated',
            'Great Move..'
          );
        },
        (error) => {
          this.initWebDirectoryData(this.selectedBussinessUnit?.id);
          this.toastr.error(error.error.message, 'Error');
        }
      );
  }
}
