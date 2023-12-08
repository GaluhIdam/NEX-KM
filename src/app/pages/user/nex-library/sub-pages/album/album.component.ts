import { Component, OnDestroy, OnInit } from '@angular/core';
import Shepherd from 'shepherd.js';
import { PopularInterface } from '../../interfaces/popular-interface';
import {
  faArrowRight,
  faBookBookmark,
  faBookOpen,
  faImage,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import { AlbumCategoryDTO } from 'src/app/core/dtos/nex-library/album-category.dto';
import { AlbumDTO } from 'src/app/core/dtos/nex-library/album.dto';
import { Subject, takeUntil, tap } from 'rxjs';
import { Router } from '@angular/router';
import { AlbumDataService } from 'src/app/core/services/nex-library/album-data.service';
import { AlbumCategoryDataService } from 'src/app/core/services/nex-library/album-category-data.service';
import { environment } from 'src/environments/environment.prod';
import * as moment from 'moment';
import { PaginatorRequest } from 'src/app/core/requests/paginator.request';
import { ParamsRequest } from 'src/app/core/requests/params.request';
import { LocalService } from 'src/app/core/services/local/local.service';
import { guideNexLibraryAlbum } from 'src/app/core/const/guide/tour-guide.const';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-album',
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.css'],
})
export class AlbumComponent implements OnInit, OnDestroy {
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

  //Album Category Data
  albumCategoryData: AlbumCategoryDTO[];

  //Album Data
  albumData: AlbumDTO[];

  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  selectedAlbumCategory: AlbumCategoryDTO | undefined;

  paginator?: PaginatorRequest;
  dataRequest?: ParamsRequest;

  pages: number[];

  //default params
  searchValue: String;
  sortBy: string;
  sortStatus: number;

  isCategoryLoading: boolean;
  isContentLoading: boolean;

  constructor(
    private readonly router: Router,
    private readonly albumDataService: AlbumDataService,
    private readonly albumCategoryDataService: AlbumCategoryDataService,
    private readonly localService: LocalService
  ) {
    this.albumCategoryData = [];
    this.albumData = [];
    this.pages = [];
    this.searchValue = '';
    this.sortBy = 'asc';
    this.sortStatus = 0;
    this.isCategoryLoading = false;
    this.isContentLoading = false;
  }

  ngOnInit(): void {
    this.initPaginator();
    this.initParams();
    this.initAlbumCategoryData();
    this.tour.addStep({
      id: 'album-step',
      title: 'Welcome To Album Page',
      text: 'You saw an album and published it here.',
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
      id: 'album-step-1',
      title: 'Categories Album',
      text: 'When posting a photo, you can set the desired category for the album.',
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
      id: 'album-step-2',
      title: 'Manage Album',
      text: 'You can manage the albums and their posts',
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
      id: 'album-step-3',
      title: 'Publish album',
      text: 'You can publish album here.',
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
    if (localStorage.getItem(guideNexLibraryAlbum.MODULE)) {
    } else {
      this.tour.start();
    }
  }

  removeTourMarkLevel() {
    this.localService.removeData(guideNexLibraryAlbum.MODULE);
    this.onCancelTour();
  }

  onCancelTour() {
    this.localService.saveData(
      guideNexLibraryAlbum.MODULE,
      JSON.stringify(true)
    );
  }

  ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.unsubscribe();
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
            this.localService.saveData(
              'album_categories',
              JSON.stringify(this.albumCategoryData)
            );
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

            this.initAlbumData(this.selectedAlbumCategory?.id);
          }
        }
      });
  }

  initAlbumData(albumCategoryId: number | undefined): void {
    let params: string = `page=${this.dataRequest?.page ?? 1}&limit=${
      this.dataRequest?.limit
    }&status=true&approval_status=Approved`;
    if (albumCategoryId) {
      params += `&id_album_category=${albumCategoryId}`;
    }
    if (this.searchValue) {
      params += `&search=${this.searchValue}`;
    }
    if (this.sortBy) {
      params += `&sortBy=${this.sortBy}`;
    }

    this.isContentLoading = true;
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
        this.isContentLoading = false;
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

  onGoToPublishAlbumPage() {
    this.localService.saveData(
      'url_back_from_publish_album',
      '/user/nex-library/album'
    );
    this.router.navigate(['/user/nex-library/publish-album']);
  }

  onGoToManageAlbumPage() {
    this.router.navigate(['/user/nex-library/my-album']);
  }

  onGoToDetailAlbum(uuid: string): void {
    this.localService.saveData(
      'selected_album_category',
      JSON.stringify(this.selectedAlbumCategory)
    );
    this.router.navigate(['/user/nex-library/album/' + uuid]);
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

      this.initAlbumData(this.selectedAlbumCategory?.id);
    }
  }
}
