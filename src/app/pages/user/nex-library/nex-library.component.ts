import Shepherd from 'shepherd.js';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import {
  faSearch,
  faBookOpen,
  faImage,
  faBookBookmark,
  faFire,
  faCalendarDay,
  faArrowRight,
  faEarth,
} from '@fortawesome/free-solid-svg-icons';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { Router, UrlTree } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EBookDataService } from 'src/app/core/services/nex-library/ebook-data.service';
import { EBookDTO } from 'src/app/core/dtos/nex-library/ebook.dto';
import { EBookDataRequest } from './requests/ebook/ebook-data.request';
import { Subject, takeUntil, tap } from 'rxjs';
import { PaginatorRequest } from 'src/app/core/requests/paginator.request';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import { EBookCategoryDTO } from 'src/app/core/dtos/nex-library/ebook-category.dto';
import { EBookCategoryDataService } from 'src/app/core/services/nex-library/ebook-category-data.service';
import { UnitDinasDTO } from 'src/app/core/dtos/nex-library/unit-dinas.dto';
import { UnitDinasDataService } from 'src/app/core/services/nex-library/unit-dinas-data.service';
import { AlbumDTO } from 'src/app/core/dtos/nex-library/album.dto';
import { AlbumDataService } from 'src/app/core/services/nex-library/album-data.service';
import * as moment from 'moment';
import { LocalService } from 'src/app/core/services/local/local.service';
import { guideNexLibrary } from 'src/app/core/const/guide/tour-guide.const';
import { EbookDTO } from '../dashboard-user/dtos/searchResults';
@Component({
  selector: 'app-nex-library',
  templateUrl: './nex-library.component.html',
  styleUrls: ['./nex-library.component.css'],
})
export class NexLibraryComponent implements OnInit, OnDestroy {
  bg_library = '../../../../assets/image/library/bg-library.jpg';
  faSearch = faSearch;
  faBookOpen = faBookOpen;
  faImage = faImage;
  faBookBookmark = faBookBookmark;
  faFire = faFire;
  faCalendarDay = faCalendarDay;
  faArrowRight = faArrowRight;
  faEarth = faEarth;

  screenWidth: number = 0;
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.screenWidth = window.innerWidth;
  }

  // tour guide
  tour = new Shepherd.Tour({
    defaultStepOptions: {
      scrollTo: { behavior: 'smooth', block: 'center' },
    },
    useModalOverlay: true,
  });

  customOptionsOne: OwlOptions = {
    margin: 20,
    autoplay: true,
    autoplayTimeout: 2000,
    autoplayHoverPause: true,
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: false,
    navSpeed: 600,
    navText: ['&#8249', '&#8250;'],
    responsive: {
      0: {
        items: 1,
      },
      400: {
        items: 2,
      },
      760: {
        items: 3,
      },
      1000: {
        items: 4,
      },
    },
    nav: false,
  };
  customOptionsTwo: OwlOptions = {
    margin: 20,
    autoplay: true,
    autoplayTimeout: 2100,
    autoplayHoverPause: true,
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: false,
    navSpeed: 600,
    responsive: {
      0: {
        items: 1,
      },
      400: {
        items: 4,
      },
      760: {
        items: 4,
      },
      1000: {
        items: 4,
      },
    },
  };
  customOptionsThree: OwlOptions = {
    margin: 20,
    autoplay: true,
    autoplayTimeout: 1800,
    autoplayHoverPause: true,
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: false,
    navSpeed: 600,
    navText: ['&#8249', '&#8250;'],
    responsive: {
      0: {
        items: 1,
      },
      400: {
        items: 4,
      },
      760: {
        items: 4,
      },
      1000: {
        items: 4,
      },
    },
    nav: false,
  };

  //Recomendation Book Data
  eBookData: EBookDTO[];

  //Trending Book Data
  eBookTrendingData: EBookDTO[];

  //lastest Upload Book Data
  eBookLatestData: EBookDTO[];

  //Category Popular Data
  eBookCategoryData: EBookCategoryDTO[];

  //Album Gallery Data
  albumData: AlbumDTO[];

  //Web Directory Unit
  webDirectoryUnitData: UnitDinasDTO[];

  dataRequest: EBookDataRequest = {};
  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();
  filterRequest: object = {};

  isBookRecommndationLoading: boolean;
  isBookTrendingLoading: boolean;
  isBookLastUploadLoading: boolean;
  isBookCategoryLoading: boolean;
  isAlbumLoading: boolean;
  isWebDirectoryLoading: boolean;
  isWebDirectoryHover: boolean[];
  isBookRecommendationHover: boolean[];
  isBookTrendingHover: boolean[];
  isBookLastUploadHover: boolean[];
  isBookPopularCategoryHover: boolean[];
  isAlbumHover: boolean[];

  constructor(
    private readonly router: Router,
    private readonly eBookDataService: EBookDataService,
    private readonly eBookCategoryDataService: EBookCategoryDataService,
    private readonly albumDataService: AlbumDataService,
    private readonly unitDinasDataService: UnitDinasDataService,
    private readonly localService: LocalService
  ) {
    this.eBookData = [];
    this.eBookTrendingData = [];
    this.eBookLatestData = [];
    this.eBookCategoryData = [];
    this.albumData = [];
    this.webDirectoryUnitData = [];
    this.isBookRecommndationLoading = false;
    this.isBookTrendingLoading = false;
    this.isBookLastUploadLoading = false;
    this.isBookCategoryLoading = false;
    this.isAlbumLoading = false;
    this.isWebDirectoryLoading = false;
    this.isWebDirectoryHover = [];
    this.isBookRecommendationHover = [];
    this.isBookTrendingHover = [];
    this.isBookLastUploadHover = [];
    this.isBookPopularCategoryHover = [];
    this.isAlbumHover = [];
  }

  ngOnInit(): void {
    this.screenWidth = window.innerWidth;

    this.initEBookRecommendationData();
    this.initEBookTrendingData();
    this.initEBookLatestUploadData();
    this.initEBookCategoryData();
    this.initAlbumData();
    this.initWebDirectoryUnitData();
    this.tour.addStep({
      id: 'library-step',
      title: 'Welcome To Nex Library',
      text: 'You saw an ebook, a photo post, and published it here.',
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
      id: 'library-step-1',
      title: 'Book Recommendation',
      text: 'This is a recommended book available at Nex Library.',
      attachTo: {
        element: '.first-feature',
        on: 'bottom',
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
      id: 'library-step-2',
      title: 'Now Trending',
      text: 'This is a trending book at the moment.',
      attachTo: {
        element: '.second-feature',
        on: 'bottom',
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
      id: 'library-step-3',
      title: 'Latest Upload',
      text: 'You can see the latest updates from the books and photos you have published',
      attachTo: {
        element: '.third-feature',
        on: 'bottom',
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
      id: 'library-step-4',
      title: 'Categories',
      text: 'You can choose the current category',
      attachTo: {
        element: '.fourth-feature',
        on: 'bottom',
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
      id: 'library-step-5',
      title: 'Photo Gallery',
      text: 'You can see the current photo gallery',
      attachTo: {
        element: '.fifth-feature',
        on: 'bottom',
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
      id: 'library-step-6',
      title: 'Web Directory',
      text: 'You can see the current web directory',
      attachTo: {
        element: '.sixty-feature',
        on: 'bottom',
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
    if (localStorage.getItem(guideNexLibrary.MODULE)) {
    } else {
      this.tour.start();
    }
  }

  removeTourMarkLevel() {
    this.localService.removeData(guideNexLibrary.MODULE);
    this.onCancelTour();
  }

  onCancelTour() {
    this.localService.saveData(guideNexLibrary.MODULE, JSON.stringify(true));
  }

  ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.unsubscribe();
  }

  initEBookRecommendationData(): void {
    this.isBookRecommndationLoading = true;
    this.eBookDataService
      .getEBookData('page=1&limit=5&status=true&approval_status=Approved')
      .pipe(
        tap((response) => {
          this.isBookRecommendationHover = new Array(
            response.data.data.length
          ).fill(false);
          response.data.data.forEach((element) => {
            element.pathCover =
              environment.httpUrl +
              '/v1/api/file-manager/get-imagepdf/' +
              element.pathCover;
          });
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe(
        (response) => {
          this.isBookRecommndationLoading = false;
          this.eBookData = response.data.data;
        },
        (error) => {
          this.isBookRecommndationLoading = false;
          this.eBookData = [];
        }
      );
  }

  initEBookTrendingData(): void {
    this.isBookTrendingLoading = true;
    this.eBookDataService
      .getEBookData(
        'page=1&limit=5&sortBy=trending&status=true&approval_status=Approved'
      )
      .pipe(
        tap((response) => {
          this.isBookTrendingHover = new Array(response.data.data.length).fill(
            false
          );
          response.data.data.forEach((element) => {
            element.pathCover =
              environment.httpUrl +
              '/v1/api/file-manager/get-imagepdf/' +
              element.pathCover;
          });
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe(
        (response) => {
          this.isBookTrendingLoading = false;
          this.eBookTrendingData = response.data.data;
        },
        (error) => {
          this.isBookTrendingLoading = false;
          this.eBookTrendingData = [];
        }
      );
  }

  initEBookLatestUploadData(): void {
    this.isBookLastUploadLoading = true;
    this.eBookDataService
      .getEBookData(
        'page=1&limit=5&sortBy=desc&status=true&approval_status=Approved'
      )
      .pipe(
        tap((response) => {
          this.isBookLastUploadHover = new Array(
            response.data.data.length
          ).fill(false);
          response.data.data.forEach((element) => {
            element.pathCover =
              environment.httpUrl +
              '/v1/api/file-manager/get-imagepdf/' +
              element.pathCover;
          });
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe(
        (response) => {
          this.isBookLastUploadLoading = false;
          this.eBookLatestData = response.data.data;
        },
        (error) => {
          this.isBookLastUploadLoading = false;
          this.eBookLatestData = [];
        }
      );
  }

  initEBookCategoryData(): void {
    this.isBookCategoryLoading = true;
    this.eBookCategoryDataService
      .getEBookCategoryData('page=1&limit=10&is_active=true&sort_by=popular')
      .pipe(
        tap((response) => {
          this.isBookPopularCategoryHover = new Array(
            response.data.data.length
          ).fill(false);
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe(
        (response) => {
          this.isBookCategoryLoading = false;
          this.eBookCategoryData = response.data.data;
        },
        (error) => {
          this.isBookCategoryLoading = false;
          this.eBookCategoryData = [];
        }
      );
  }

  initAlbumData(): void {
    this.isAlbumLoading = true;
    this.albumDataService
      .getAlbumData('page=1&limit=6&status=true&approval_status=Approved')
      .pipe(
        tap((response) => {
          this.isAlbumHover = new Array(response.data.data.length).fill(false);
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
        this.isAlbumLoading = false;
        this.albumData = response.data.data;
      });
  }

  initWebDirectoryUnitData(): void {
    this.isWebDirectoryLoading = true;
    this.unitDinasDataService
      .getAllUnitDinasData()
      .pipe(
        tap((response) => {
          this.isWebDirectoryHover = new Array(response.data.length).fill(
            false
          );
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe((response) => {
        this.isWebDirectoryLoading = false;
        this.webDirectoryUnitData = response.data;
      });
  }

  onGoToPublishEbookPage() {
    this.localService.saveData(
      'url_back_from_publish_ebook',
      '/user/nex-library'
    );
    this.router.navigate(['/user/nex-library/publish-book']);
  }

  onGoToPublishAlbumPage() {
    this.localService.saveData(
      'url_back_from_publish_album',
      '/user/nex-library'
    );
    this.router.navigate(['/user/nex-library/publish-album']);
  }

  onGoToDetailBook(uuid: string): void {
    this.router.navigate(['/user/nex-library/ebook/' + uuid]);
  }

  onGoToDetailAlbum(uuid: string): void {
    this.router.navigate(['/user/nex-library/album/' + uuid]);
  }

  formattedDate(date: string): string {
    return moment(date).format('LL');
  }

  onChangeWebDirectoryHover(value: boolean, index: number) {
    this.isWebDirectoryHover[index] = value;
  }

  onChangeBookRecommendationHover(value: boolean, index: number) {
    this.isBookRecommendationHover[index] = value;
  }

  onChangeBookTrendingHover(value: boolean, index: number) {
    this.isBookTrendingHover[index] = value;
  }

  onChangeBookLastUploadHover(value: boolean, index: number) {
    this.isBookLastUploadHover[index] = value;
  }

  onChangeBookPopularCategoryHover(value: boolean, index: number) {
    this.isBookPopularCategoryHover[index] = value;
  }

  onChangeAlbumHover(value: boolean, index: number) {
    this.isAlbumHover[index] = value;
  }

  onClickBussinessUnit(bussinessUnit: UnitDinasDTO): void {
    this.localService.saveData(
      'selected_unit_dinas',
      JSON.stringify(bussinessUnit)
    );
    this.router.navigate(['/user/nex-library/directory']);
  }

  onGoToWebDirectoryPage(): void {
    this.localService.removeData('selected_unit_dinas');
    this.router.navigate(['/user/nex-library/directory']);
  }

  onClickEbookCategory(category: EBookCategoryDTO): void {
    this.localService.saveData(
      'selected_ebook_category',
      JSON.stringify(category)
    );
    this.router.navigate(['/user/nex-library/ebook']);
  }

  onGoToEbookPage(): void {
    this.localService.removeData('selected_ebook_category');
    this.router.navigate(['/user/nex-library/ebook']);
  }
}
