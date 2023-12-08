import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  faArrowRight,
  faBookBookmark,
  faBookOpen,
  faImage,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import { EBookCategoryDTO } from 'src/app/core/dtos/nex-library/ebook-category.dto';
import { Subject, takeUntil, tap } from 'rxjs';
import { Router } from '@angular/router';
import { EBookDataService } from 'src/app/core/services/nex-library/ebook-data.service';
import { EBookCategoryDataService } from 'src/app/core/services/nex-library/ebook-category-data.service';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import { EBookDTO } from 'src/app/core/dtos/nex-library/ebook.dto';
import { PaginatorRequest } from 'src/app/core/requests/paginator.request';
import { ParamsRequest } from 'src/app/core/requests/params.request';
import { LocalService } from 'src/app/core/services/local/local.service';
import Shepherd from 'shepherd.js';
import { guideNexLibraryEbook } from 'src/app/core/const/guide/tour-guide.const';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
@Component({
  selector: 'app-ebook',
  templateUrl: './ebook.component.html',
  styleUrls: ['./ebook.component.css'],
})
export class EbookComponent implements OnInit, OnDestroy {
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

  //Category Popular Data
  eBookCategoryData: EBookCategoryDTO[];

  //Book Data
  eBookData: EBookDTO[];

  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  selectedEBookCategory: EBookCategoryDTO | undefined;

  paginator?: PaginatorRequest;
  dataRequest?: ParamsRequest;

  pages: number[];

  //default params
  searchValue: String;
  sortBy: string;
  sortStatus: number;

  isCategoryLoading: boolean;
  isContentLoading: boolean;

  isBookCategoryHover: boolean[];

  constructor(
    private readonly router: Router,
    private readonly eBookDataService: EBookDataService,
    private readonly eBookCategoryDataService: EBookCategoryDataService,
    private readonly localService: LocalService
  ) {
    this.eBookCategoryData = [];
    this.eBookData = [];
    this.searchValue = '';
    this.sortBy = 'asc';
    this.sortStatus = 0;
    this.isCategoryLoading = false;
    this.isContentLoading = false;
    this.pages = [];
    this.isBookCategoryHover = [];
  }

  ngOnInit(): void {
    this.initPaginator();
    this.initParams();
    this.initEBookCategoryData();
    this.tour.addStep({
      id: 'book-step',
      title: 'Welcome To Ebook Page',
      text: 'You can manage the books and their posts.',
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
      id: 'book-step-1',
      title: 'Book',
      text: 'When posting a book, you can set the desired category for the book.',
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
      id: 'book-step-2',
      title: 'Manage Book',
      text: 'You can manage the books and their posts',
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
      id: 'book-step-3',
      title: 'Publish Book',
      text: 'You can publish book here.',
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
    if (localStorage.getItem(guideNexLibraryEbook.MODULE)) {
    } else {
      this.tour.start();
    }
  }

  removeTourMarkLevel() {
    this.localService.removeData(guideNexLibraryEbook.MODULE);
    this.onCancelTour();
  }

  onCancelTour() {
    this.localService.saveData(
      guideNexLibraryEbook.MODULE,
      JSON.stringify(true)
    );
  }

  ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.unsubscribe();
  }

  initEBookCategoryData(): void {
    this.isCategoryLoading = true;
    this.eBookCategoryDataService
      .getEBookCategoryData('page=1&limit=1000&is_active=true')
      .pipe(tap(), takeUntil(this._onDestroy$))
      .subscribe((response) => {
        this.isCategoryLoading = false;
        this.isBookCategoryHover = new Array(response.data.data.length).fill(
          false
        );
        this.eBookCategoryData = response.data.data;
        if (this.selectedEBookCategory === undefined) {
          if (this.eBookCategoryData.length > 0) {
            const selectedCategory = this.localService.getData(
              'selected_ebook_category'
            );
            if (selectedCategory !== null) {
              this.selectedEBookCategory = JSON.parse(selectedCategory);
            } else {
              this.selectedEBookCategory = this.eBookCategoryData[0];
              this.localService.saveData(
                'selected_ebook_category',
                JSON.stringify(this.selectedEBookCategory)
              );
            }
            this.initEBookData(this.selectedEBookCategory?.id);
          }
        }
      });
  }

  initEBookData(ebookCategoryId: number | undefined): void {
    let params: string = `page=${this.dataRequest?.page ?? 1}&limit=${
      this.dataRequest?.limit
    }&status=true&approval_status=Approved`;
    if (ebookCategoryId) {
      params += `&id_ebook_category=${ebookCategoryId}`;
    }
    if (this.searchValue) {
      params += `&search=${this.searchValue}`;
    }
    if (this.sortBy) {
      params += `&sortBy=${this.sortBy}`;
    }

    this.isContentLoading = true;
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
        this.isContentLoading = false;
        this.eBookData = response.data.data;
        if (this.paginator) {
          this.paginator.totalData = response.data.totalItems;
          this.paginator.totalPage = response.data.totalPages;
          this.pages = new Array(this.paginator.totalPage);
        }
      });
  }

  onChangeEBookCategory(eBookCategory: EBookCategoryDTO): void {
    this.selectedEBookCategory = eBookCategory;
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

  onGoToPublishEbookPage() {
    this.localService.saveData(
      'url_back_from_publish_ebook',
      '/user/nex-library/ebook'
    );
    this.router.navigate(['/user/nex-library/publish-book']);
  }

  onGoToManageEbookPage() {
    this.router.navigate(['/user/nex-library/manage-book']);
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

      this.initEBookData(this.selectedEBookCategory?.id);
    }
  }

  onChangeBookCategoryHover(value: boolean, index: number) {
    this.isBookCategoryHover[index] = value;
  }
}
