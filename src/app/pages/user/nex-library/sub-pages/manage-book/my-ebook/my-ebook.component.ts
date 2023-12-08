import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  faArrowRight,
  faBookBookmark,
  faBookOpen,
  faImage,
  faSearch,
  faStar,
  faBars,
} from '@fortawesome/free-solid-svg-icons';
import { EBookDTO } from 'src/app/core/dtos/nex-library/ebook.dto';
import { Subject, takeUntil, tap } from 'rxjs';
import { Router } from '@angular/router';
import { EBookDataService } from 'src/app/core/services/nex-library/ebook-data.service';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import { PaginatorRequest } from 'src/app/core/requests/paginator.request';
import { ParamsRequest } from 'src/app/core/requests/params.request';
import Swal from 'sweetalert2';
import { KeycloakService } from 'keycloak-angular';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-my-ebook',
  templateUrl: './my-ebook.component.html',
  styleUrls: ['./my-ebook.component.css'],
})
export class MyEbookComponent implements OnInit, OnDestroy {
  faArrowRight = faArrowRight;
  faBookOpen = faBookOpen;
  faImage = faImage;
  faSearch = faSearch;
  faBookBookmark = faBookBookmark;
  faStar = faStar;
  faBars = faBars;

  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  //Book Data
  eBookData: EBookDTO[];

  paginator?: PaginatorRequest;
  dataRequest?: ParamsRequest;

  pages: number[];

  //default params
  searchValue: String;
  sortBy: string;
  sortStatus: number;
  personalNumber: string;

  isLoading: boolean;

  constructor(
    private readonly router: Router,
    private readonly eBookDataService: EBookDataService,
    private readonly keycloakService: KeycloakService,
    private readonly toastr: ToastrService
  ) {
    this.eBookData = [];
    this.pages = [];
    this.searchValue = '';
    this.sortBy = 'asc';
    this.sortStatus = 0;
    this.personalNumber = '';
    this.isLoading = false;
  }

  ngOnInit(): void {
    this.initializeUserOptions();
    this.initPaginator();
    this.initParams();
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

  initEBookData(refresh?: boolean): void {
    let params: string = `page=${this.dataRequest?.page ?? 1}&limit=${
      this.dataRequest?.limit
    }`;
    if (this.searchValue) {
      params += `&search=${this.searchValue}`;
    }
    if (this.sortBy) {
      params += `&sortBy=${this.sortBy}`;
    }
    if (this.personalNumber) {
      params += `&personalNumber=${this.personalNumber}`;
    }

    if (refresh) {
      this.isLoading = true;
    }
    this.eBookDataService
      .getEBookData(params)
      .pipe(
        tap((response) => {
          response.data.data.forEach((element) => {
            element.pathCover =
              environment.httpUrl +
              '/v1/api/file-manager/get-imagepdf/' +
              element.pathCover;
          });
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe((response) => {
        if (refresh) {
          this.isLoading = false;
        }
        this.eBookData = response.data.data;
        this.calculateTotalRateEBook(this.eBookData);
        if (this.paginator) {
          this.paginator.totalData = response.data.totalItems;
          this.paginator.totalPage = response.data.totalPages;
          this.pages = new Array(this.paginator.totalPage);
        }
      });
  }

  calculateTotalRateEBook(eBookData: EBookDTO[]): void {
    eBookData.map((data) => {
      let rate = 0;
      data.totalRate = 0;
      if (data.ebooksEbookReviews.length > 0) {
        data.ebooksEbookReviews.map((review) => {
          rate += review.rate;
        });
        data.totalRate = rate / data.ebooksEbookReviews.length;
      }
    });
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

  onGoToDetailBook(uuid: string): void {
    this.router.navigate(['/user/nex-library/ebook/' + uuid]);
  }

  onGoToEditBook(uuid: string): void {
    this.router.navigate(['/user/nex-library/ebook-edit/' + uuid]);
  }

  onChangeEbookStatus(status: boolean, uuid: string): void {
    const request = {
      status: status,
    };

    this.eBookDataService.updateEbookStatus(uuid, request).subscribe(
      (success) => {
        this.initEBookData();
        this.toastr.success(
          status
            ? 'The Ebook you selected has been activated'
            : 'The Ebook you selected has been deactivated',
          'Great Move..'
        );
      },
      (error) => {
        this.initEBookData();
        this.toastr.error(error.error.message, 'Great Move..');
      }
    );
  }

  initPaginator(): void {
    this.paginator = {
      pageOption: [10, 20, 50, 100],
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

      this.initEBookData(true);
    }
  }
}
