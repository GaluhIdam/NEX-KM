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
import { Router } from '@angular/router';
import { AlbumDataService } from 'src/app/core/services/nex-library/album-data.service';
import { Subject, takeUntil, tap } from 'rxjs';
import { AlbumDTO } from 'src/app/core/dtos/nex-library/album.dto';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import * as moment from 'moment';
import { PaginatorRequest } from 'src/app/core/requests/paginator.request';
import { ParamsRequest } from 'src/app/core/requests/params.request';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { KeycloakService } from 'keycloak-angular';
import { LocalService } from 'src/app/core/services/local/local.service';
import { AlbumCategoryDTO } from 'src/app/core/dtos/nex-library/album-category.dto';
import { AlbumCategoryDataService } from 'src/app/core/services/nex-library/album-category-data.service';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-my-album',
  templateUrl: './my-album.component.html',
  styleUrls: ['./my-album.component.css'],
})
export class MyAlbumComponent implements OnInit, OnDestroy {
  faChevronRight = faChevronRight;
  faBookOpen = faBookOpen;
  faImage = faImage;
  faSearch = faSearch;
  faBookBookmark = faBookBookmark;
  faStar = faStar;
  faBars = faBars;

  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  //Album Category Data
  albumCategoryData: AlbumCategoryDTO[];

  selectedAlbumCategory: AlbumCategoryDTO | undefined;

  //Album Data
  albumData: AlbumDTO[];

  paginator?: PaginatorRequest;
  dataRequest?: ParamsRequest;

  pages: number[];

  //default params
  searchValue: String;
  sortBy: string;
  sortStatus: number;
  personalNumber: string;

  isCategoryLoading: boolean;
  isContentLoading: boolean;

  constructor(
    private readonly router: Router,
    private readonly albumDataService: AlbumDataService,
    private readonly albumCategoryDataService: AlbumCategoryDataService,
    private readonly toastr: ToastrService,
    private readonly keycloakService: KeycloakService,
    private readonly localService: LocalService
  ) {
    this.albumData = [];
    this.pages = [];
    this.searchValue = '';
    this.sortBy = 'asc';
    this.sortStatus = 0;
    this.isCategoryLoading = false;
    this.isContentLoading = false;
    this.personalNumber = '';
    this.albumCategoryData = [];
  }

  ngOnInit(): void {
    this.initializeUserOptions();
    this.initPaginator();
    this.initParams();
    this.initAlbumCategoryData();
  }
  ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.unsubscribe();
  }

  //GET Personal Number from Keycloak
  private initializeUserOptions(): void {
    this.personalNumber = this.keycloakService.getUsername();
  }

  initAlbumCategoryData(): void {
    this.isCategoryLoading = true;
    this.albumCategoryDataService
      .getAlbumCategoryData('page=1&limit=1000&is_active=true')
      .pipe(tap(), takeUntil(this._onDestroy$))
      .subscribe((response) => {
        this.isCategoryLoading = false;
        this.albumCategoryData = response.data.data;
        if (this.selectedAlbumCategory === undefined) {
          if (this.albumCategoryData.length > 0) {
            const selectedCategory = this.localService.getData(
              'selected_album_category'
            );

            if (selectedCategory !== null) {
              this.selectedAlbumCategory = JSON.parse(selectedCategory);
            } else {
              this.selectedAlbumCategory = this.albumCategoryData[0];
              this.localService.saveData(
                'selected_album_category',
                JSON.stringify(this.selectedAlbumCategory)
              );
            }

            this.initAlbumData(this.selectedAlbumCategory?.id, true);
          }
        }
      });
  }

  initAlbumData(albumCategoryId: number | undefined, refresh?: boolean): void {
    let params: string = `page=${this.dataRequest?.page ?? 1}&limit=${
      this.dataRequest?.limit
    }`;
    if (albumCategoryId) {
      params += `&id_album_category=${albumCategoryId}`;
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

    if (refresh) {
      this.isContentLoading = true;
    }
    this.albumDataService
      .getAlbumData(params)
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
        if (refresh) {
          this.isContentLoading = false;
        }
        this.albumData = response.data.data;
        if (this.paginator) {
          this.paginator.totalData = response.data.totalItems;
          this.paginator.totalPage = response.data.totalPages;
          this.pages = new Array(this.paginator.totalPage);
        }
      });
  }

  onChangeAlbumCategory(albumCategory: AlbumCategoryDTO): void {
    this.selectedAlbumCategory = albumCategory;
    this.localService.saveData(
      'selected_album_category',
      JSON.stringify(this.selectedAlbumCategory)
    );
    this.rePaginate(true);
  }

  onChangeAlbumStatus(status: boolean, uuid: string): void {
    const request = {
      status: status,
    };

    this.albumDataService.updateAlbumStatus(uuid, request).subscribe(
      (success) => {
        this.initAlbumData(this.selectedAlbumCategory?.id);
        this.toastr.success(
          status
            ? 'The Album you selected has been activated'
            : 'The Album you selected has been deactivated',
          'Great Move..'
        );
      },
      (error) => {
        this.initAlbumData(this.selectedAlbumCategory?.id);
        this.toastr.error(error.error.message, 'Error');
      }
    );
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

  onGoToDetailAlbum(uuid: string): void {
    this.localService.saveData(
      'selected_album_category',
      JSON.stringify(this.selectedAlbumCategory)
    );
    this.router.navigate(['/user/nex-library/album/' + uuid]);
  }

  onGoToEditAlbum(uuid: string): void {
    this.localService.saveData(
      'selected_album_category',
      JSON.stringify(this.selectedAlbumCategory)
    );
    this.router.navigate(['/user/nex-library/edit-album/' + uuid]);
  }

  formattedDate(date: string): string {
    return moment(date).format('LL');
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

      this.initAlbumData(this.selectedAlbumCategory?.id, true);
    }
  }
}
