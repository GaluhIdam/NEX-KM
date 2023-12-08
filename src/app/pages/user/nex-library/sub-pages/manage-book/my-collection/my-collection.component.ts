import { Component, OnDestroy, OnInit } from '@angular/core';
import { PopularInterface } from '../../../interfaces/popular-interface';
import {
  faArrowRight,
  faBookBookmark,
  faBookOpen,
  faImage,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import { Subject, takeUntil, tap } from 'rxjs';
import { Router } from '@angular/router';
import { EBookDataService } from 'src/app/core/services/nex-library/ebook-data.service';
import { environment } from 'src/environments/environment.prod';
import { EBookCollectionDataService } from 'src/app/core/services/nex-library/ebook-collection-data.service';
import { PaginatorRequest } from 'src/app/core/requests/paginator.request';
import { ParamsRequest } from 'src/app/core/requests/params.request';
import { EBookCollectionDTO } from 'src/app/core/dtos/nex-library/ebook-colllection.dto';

@Component({
  selector: 'app-my-collection',
  templateUrl: './my-collection.component.html',
  styleUrls: ['./my-collection.component.css'],
})
export class MyCollectionComponent implements OnInit, OnDestroy {
  faArrowRight = faArrowRight;
  faBookOpen = faBookOpen;
  faImage = faImage;
  faSearch = faSearch;
  faBookBookmark = faBookBookmark;

  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  //Book Data
  eBookData: EBookCollectionDTO[];

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
    private readonly eBookCollectionDataService: EBookCollectionDataService
  ) {
    this.eBookData = [];
    this.pages = [];
    this.searchValue = '';
    this.sortBy = 'asc';
    this.sortStatus = 0;
    //TODO: params personal number still hardcode, change later
    this.personalNumber = '12345';
    this.isLoading = false;
  }

  ngOnInit(): void {
    this.initPaginator();
    this.initParams();
    this.initEBookData();
  }
  ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.unsubscribe();
  }

  initEBookData(): void {
    let params: string = `page=${this.dataRequest?.page ?? 1}&limit=${
      this.dataRequest?.limit
    }&status=true`;
    if (this.searchValue) {
      params += `&search=${this.searchValue}`;
    }
    if (this.sortBy) {
      params += `&sortBy=${this.sortBy}`;
    }

    //TODO: params personal number still hardcode, change later
    if (this.personalNumber) {
      params += `personalNumber=${this.personalNumber}`;
    }

    this.isLoading = true;
    this.eBookCollectionDataService
      .getEBookCollectionData(params)
      .pipe(
        tap((response) => {
          response.data.data.forEach((element) => {
            element.collectionEbook.pathCover =
              environment.httpUrl +
              '/v1/api/file-manager/get-imagepdf/' +
              element.collectionEbook.pathCover;
          });
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe((response) => {
        this.isLoading = false;
        this.eBookData = response.data.data;
        if (this.paginator) {
          this.paginator.totalData = response.data.totalItems;
          this.paginator.totalPage = response.data.totalPages;
          this.pages = new Array(this.paginator.totalPage);
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

  initPaginator(): void {
    this.paginator = {
      pageOption: [8, 16, 32, 64],
      pageNumber: 1,
      pageSize: 8,
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
        this.paginator.pageSize = 8;
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
}
