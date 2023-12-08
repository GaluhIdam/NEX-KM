import { PointDTO } from 'src/app/pages/user/nex-level/dtos/point.dto';
import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { Select, Modal, initTE, Tooltip } from 'tw-elements';
import {
  faEllipsis,
  faChevronRight,
  faPlus,
  faWallet,
  faChevronLeft,
  faCircleChevronLeft,
  faCircleChevronRight,
  faSearch,
  faSadTear,
} from '@fortawesome/free-solid-svg-icons';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { ParamsRequest } from 'src/app/core/requests/params.request';
import { PaginatorRequest } from 'src/app/core/requests/paginator.request';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NexLevelService } from './nex-level.service';
import { MerchandiseComponent } from './sub-pages/merchandise/merchandise.component';
import { EMPTY, Observable, Subject, Subscription, catchError, debounceTime, from, map, of, pipe, switchMap, takeUntil, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import { MerchandiseDTO } from './dtos/merchandise.dto';
import { MileDTO } from './dtos/mile.dto';
import { faStar } from '@fortawesome/free-regular-svg-icons';
import { KeycloakService } from 'keycloak-angular';
import { SoeService } from 'src/app/core/soe/soe.service';
import { RedeemCreateDTO, RedeemDTO } from './dtos/redeem.dto';
import Swal from 'sweetalert2';
import { PointConfigDTO } from './dtos/point-config.dto';
import Shepherd from 'shepherd.js';
import { LocalService } from 'src/app/core/services/local/local.service';
import { guideNexLevel } from 'src/app/core/const/guide/tour-guide.const';
import { NotificationRequestDTO } from '../home-page/dtos/notification.dto';
import { HomePageService } from '../home-page/homepage.service';
import { SocketService } from 'src/app/core/utility/socket-io-services/socket.io.service';
import { result } from 'lodash';

@Component({
  selector: 'app-nex-level',
  templateUrl: './nex-level.component.html',
  styleUrls: ['./nex-level.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class NexLevelComponent
  extends BaseController
  implements OnInit, OnDestroy, AfterViewInit {


  constructor(
    private readonly nexlevelService: NexLevelService,
    private readonly keycloakService: KeycloakService,
    private readonly soeService: SoeService,
    private readonly localService: LocalService,
    private readonly webSocket: SocketService,
    private readonly homepageService: HomePageService,
    private fb: FormBuilder
  ) {
    super(MerchandiseComponent.name);
    this.showTooltips = [];
    this.tableColumnHovers = new Array(17).fill(false);
  }

  private readonly unsubscribe$ = new Subject();
  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  // Font Awasome
  faChevronRight = faChevronRight;
  faChevronLeft = faChevronLeft;
  faCircleChevronRight = faCircleChevronRight;
  faCircleChevronLeft = faCircleChevronLeft;
  faEllipsis = faEllipsis;
  faPlus = faPlus;
  faWallet = faWallet;
  faStar = faStar;
  faSearch = faSearch;
  faSadTear = faSadTear;

  // tourGuide
  tour = new Shepherd.Tour({
    defaultStepOptions: {
      scrollTo: { behavior: 'smooth', block: 'center' },
    },
    useModalOverlay: true,
  });

  // inisialisasi
  merchantData: MerchandiseDTO[] = [];
  obs!: Subscription;
  currentDate = new Date();
  showTooltips: boolean[];
  tableColumnHovers: boolean[];
  userName!: string;
  totalPoint!: number;
  maxPoint!: number;
  point!: number;
  nameLevel!: string;
  imageLevel!: string;
  remainingPointByPersen!: number;
  remainingPointByDesimal!: number;
  img!: File;
  userLevelPoint: number = 0;
  dataPoint: PointDTO = {
    id: 0,
    uuid: '',
    personalNumber: '',
    personalName: '',
    personalUnit: '',
    title: '',
    personalEmail: '',
    point: 0,
    totalPoint: 0,
    createdAt: this.currentDate,
    updatedAt: this.currentDate,
  };
  dataMiles: MileDTO[] = [];
  dataRedeem: RedeemDTO[] = [];
  recentMerchandise: MerchandiseDTO = {
    id: 0,
    uuid: '',
    personalNumber: '',
    title: '',
    description: '',
    qty: 0,
    point: 0,
    _count: 0,
    isPinned: false,
    createdAt: this.currentDate,
    updatedAt: this.currentDate,
    imageMerchandise: [],
  };
  dataMerchandise: MerchandiseDTO[] = [];
  dataPointHistory: PointConfigDTO[] = [];

  //paginatorRedeem
  page: number = 1;
  pageRedeem: number = 1;
  limit: number = 5;
  limitRedeem: number = 5;
  search: string = '';
  year: string = '2023';
  searchRedeem: string = '';
  sortBy: string = 'desc';
  sortByRedeem: string = 'desc';
  personalNumber: string = '';
  minPoint: number = 0;
  totalData: number = 0;
  totalDataRedeem: number = 0;
  pageData: Array<number> = [];
  pageDataRedeem: Array<number> = [];

  //paginatorHistoryDependencies
  paginator?: PaginatorRequest;
  dataRequest?: ParamsRequest;
  count: number = 0;
  tableSize: number = 5;
  itemsPerPage: number = 5;
  currentPage: number = 1;
  totalItems: number = 12;
  pages: any;

  //slider
  customOptionsOne: OwlOptions = {
    margin: 20,
    autoplay: false,
    autoplayTimeout: 2000,
    autoplayHoverPause: false,
    loop: false,
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
        items: 1,
      },
      760: {
        items: 1,
      },
      1000: {
        items: 3,
      },
    },
    nav: false,
  };

  // mformHistory
  selectedYear: string = '2023';
  mformHistory: FormGroup = new FormGroup({
    search: new FormControl(''),
    page: new FormControl(this.page),
    limit: new FormControl(this.limit),
    sortBy: new FormControl(this.sortBy),
    personalNumber: new FormControl(this.personalNumber),
    year: new FormControl(this.year),
  });
  setYear(yearValue: string) {
    if (this.mformHistory) {
      this.mformHistory.get('year')?.setValue(yearValue);
      this.selectedYear = yearValue
    }
  }

  // mformRedeem
  mformRedeem: FormGroup = new FormGroup({
    searchRedeem: new FormControl(''),
    pageRedeem: new FormControl(this.page),
    limitRedeem: new FormControl(this.limitRedeem),
    sortByRedeem: new FormControl(this.sortByRedeem),
    personalNumber: new FormControl(this.personalNumber),
  });

  ngOnInit(): void {
    initTE({ Select, Modal, Tooltip });
    this.getUser(this.keycloakService.getUsername());
    this.getDataPoint(this.keycloakService.getUsername());
    this.getHistoryPointByPersonalNumber(this.page, this.limit, this.search, this.sortBy, this.keycloakService.getUsername(), this.year);
    this.obs = this.mformHistory.valueChanges
      .pipe(debounceTime(500))
      .subscribe((data) => {
        if (data.page < 1) {
          data.page < 1 ? this.mformHistory.get('page')?.setValue(1) : data.page;
        } else {
          this.getHistoryPointByPersonalNumber(
            data.page,
            data.limit,
            data.search,
            data.sortBy,
            this.keycloakService.getUsername(),
            data.year
          );
        }
      });
    this.getDataMerchandise(this.page, this.limit, this.search, this.sortBy);
    this.getRedeemByPersonalNumber(this.pageRedeem, this.limitRedeem, this.searchRedeem, this.sortBy, this.keycloakService.getUsername());
    this.obs = this.mformRedeem.valueChanges
      .pipe(debounceTime(500))
      .subscribe((data) => {
        if (data.pageRedeem < 1) {
          data.pageRedeem < 1 ? this.mformRedeem.get('pageRedeem')?.setValue(1) : data.pageRedeem;
        } else {
          this.getRedeemByPersonalNumber(
            data.pageRedeem,
            data.limitRedeem,
            data.searchRedeem,
            data.sortByRedeem,
            this.keycloakService.getUsername()
          );
        }
      });
    this.tour.addStep({
      id: 'welcome-step',
      title: 'Welcome To the NEX Miles',
      text: 'You can see levels, points, and redeem the desired merchandise',
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
      id: 'home-step-1',
      title: 'Point',
      text: 'This is your point now, you can increase it by doing activities in this application',
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
      id: 'home-step-2',
      title: 'Miles',
      text: 'Increase your point to get to the next miles',
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
      id: 'home-step-3',
      title: 'History',
      text: "You can see the status of activities that have been carried out in this application",
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
      id: 'home-step-4',
      title: 'Redeemed',
      text: "Check the merchandise and your redemption status here!",
      attachTo: {
        element: '.fourth-feature',
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
    if (localStorage.getItem(guideNexLevel.MODULE)) {
    } else {
      this.tour.start();
    }
  }

  removeTourMarkLevel() {
    this.localService.removeData(guideNexLevel.MODULE);
    this.onCancelTour();
  }

  onCancelTour() {
    this.localService.saveData(guideNexLevel.MODULE, JSON.stringify(true));
  }

  //Get User
  getUser(personalNumber: string): void {
    this.soeService.getUserData(personalNumber)
      .pipe(
        catchError((err) => {
          console.error(err);
          err('error', err);
          return EMPTY;
        }),
        switchMap((result) => (
          this.userName = result.personalName
        )),
        takeUntil(this._onDestroy$)
      )
      .subscribe();
  }

  //Get Point
  getDataPoint(personalNumber: string): void {
    this.nexlevelService
      .getPointByPersonalNumber(personalNumber)
      .pipe(
        catchError((err) => {
          console.error(err);
          err('error', err);
          return EMPTY;
        }),
        switchMap((data) => {
          this.dataPoint = data.data;
          this.userLevelPoint = data.data.totalPoint;
          return this.nexlevelService.getAllMile();
        }),
        tap((dtx) => {
          if (dtx.data.result) {
            dtx.data.result.forEach((dtz) => {
              dtz.path = environment.httpUrl + '/v1/api/file-manager/get-imagepdf/' + dtz.path;
            });
          }
        }),
        map((mile) => {
          this.dataMiles = mile.data.result;
          if (mile.data.result) {
            mile.data.result.forEach((mileData) => {
              if (this.dataPoint.totalPoint >= mileData.minPoint && this.dataPoint.totalPoint <= mileData.maxPoint) {
                this.totalPoint = (this.dataPoint.totalPoint - mileData.minPoint) / 300 * 100;
                this.point = (this.dataPoint.point - mileData.minPoint) / 300 * 100;
                this.remainingPointByPersen = ((mileData.maxPoint - this.dataPoint.totalPoint) / 300) * 100;
                this.imageLevel = mileData.path;
                this.remainingPointByDesimal = mileData.maxPoint - this.dataPoint.totalPoint;
                this.nameLevel = mileData.name;
              }
            });
          }
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe();
  }

  // getMile
  getMile(): void {
    this.nexlevelService
      .getAllMile()
      .pipe(
        catchError((err) => {
          console.error(err);
          err('error', err);
          return EMPTY;
        }),
        map((response) => {
          this.dataMiles = response.data.result;
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe()
  }

  // get history point
  getHistoryPointByPersonalNumber(
    page: number,
    limit: number,
    search: string,
    sortBy: string,
    personalNumber: string,
    year: string
  ): void {
    this.nexlevelService
      .getHistoryPointByPersonalNumber(page, limit, search, sortBy, personalNumber, year)
      .pipe(
        catchError((err) => {
          console.error(err);
          err('error', err);
          return EMPTY;
        }),
        switchMap((response) => {
          this.dataPointHistory = response.data.result;
          this.totalData = response.data.total;
          this.paginate(this.totalData, this.limit, this.pageData);
          return Observable.create();
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe();
  }

  // getMerchandise
  getDataMerchandise(
    page: number,
    limit: number,
    search: string,
    sortBy: string
  ): void {
    this.nexlevelService
      .getMerchandise(page, limit, search, sortBy)
      .pipe(
        catchError((err) => {
          console.error(err);
          err('error', err);
          return EMPTY;
        }),
        tap((data) => {
          if (data.data.result) {
            data.data.result.forEach((dtx) => {
              dtx.imageMerchandise[0].path =
                environment.httpUrl + '/v1/api/file-manager/get-imagepdf/' + dtx.imageMerchandise[0].path;
            });
          }
        }),
      )
      .subscribe((response) => {
        this.dataMerchandise = response.data.result;
        if (response.data.result) {
          this.recentMerchandise = response.data.result[0];
          this.totalData = response.data.total;
        }
      })
  }

  // redeemMerchandise
  async redeemProduct(merchandiseId: number): Promise<void> {
    try {
      Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        cancelButtonColor: '#d32f2f',
        confirmButtonText: 'Yes, Redeem it!',
        confirmButtonColor: '#0C82B9'
      }).then((result) => {
        if (result.isConfirmed) {
          this.soeService
            .getUserData(this.keycloakService.getUsername())
            .subscribe((response) => {
              const socket: NotificationRequestDTO = {
                senderPersonalNumber: this.keycloakService.getUsername(),
                receiverPersonalNumber: '782659',
                title: 'Create Redeem',
                description: 'Redeem Merchandise Success',
                isRead: 'false',
                contentType: "redeem",
                contentUuid: "dadadadadwae2311"
              }
              this.webSocket.sendSocket(socket).subscribe()
              this.homepageService.createNotification(socket).subscribe()
              const dto: RedeemCreateDTO = {
                merchandiseId: merchandiseId,
                personalNumber: this.keycloakService.getUsername(),
                personalName: response.personalName,
                personalUnit: response.personalUnit,
                personalEmail: response.personalEmail,
              };
              this.nexlevelService.createRedeem(dto).subscribe(() => {
                this.getRedeemByPersonalNumber(this.pageRedeem, this.limitRedeem, this.searchRedeem, this.sortByRedeem, this.keycloakService.getUsername());
                this.getDataMerchandise(this.page, this.limit, this.search, this.sortBy);
                Swal.fire({
                  icon: 'success',
                  title: 'Success!',
                  text: 'Your merchandise was successfully created.',
                  timer: 1000,
                  showConfirmButton: false,
                }).then(() => {
                  this.getRedeemByPersonalNumber(this.pageRedeem, this.limitRedeem, this.searchRedeem, this.sortByRedeem, this.keycloakService.getUsername());
                  this.getDataMerchandise(this.page, this.limit, this.search, this.sortBy);
                });
              });
            });
        }
      });
    } catch (error) {
      throw error;
    }
  }

  // get data redeem by personalNumber
  getRedeemByPersonalNumber(
    pageRedeem: number,
    limitRedeem: number,
    searchRedeem: string,
    sortByRedeem: string,
    personalNumber: string
  ): void {
    this.nexlevelService
      .getRedeemByPersonalNumber(pageRedeem, limitRedeem, searchRedeem, sortByRedeem, personalNumber)
      .pipe(
        catchError((err) => {
          console.error(err);
          err('error', err);
          return EMPTY;
        }),
        tap((data) => {
          if (data.data.result) {
            data.data.result.forEach((dtx) => {
              dtx.merchandiseRedeem.imageMerchandise[0].path =
                environment.httpUrl +
                '/v1/api/file-manager/get-imagepdf/' +
                dtx.merchandiseRedeem.imageMerchandise[0].path;
            })
          }
        }),
        map((response) => {
          this.dataRedeem = response.data.result;
          this.totalDataRedeem = response.data.total;
          this.paginate(this.totalDataRedeem, this.limitRedeem, this.pageDataRedeem);
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe()
  }

  ngAfterViewInit(): void {
    this.getDataMerchandise(this.page, this.limit, this.search, this.sortBy);
  }

  nextPage(): void {
    if (this.pageData.length > 1) {
      this.mformHistory.get('page')?.setValue(this.mformHistory.get('page')?.value + 1);
    }
  }

  prevPage(): void {
    if (this.pageData.length > 1) {
      this.mformHistory.get('page')?.setValue(this.mformHistory.get('page')?.value - 1);
    }
  }

  nextPageRedeem(): void {
    if (this.pageDataRedeem.length > 1) {
      this.mformRedeem.get('pageRedeem')?.setValue(this.mformRedeem.get('pageRedeem')?.value + 1);
    }
  }

  prevPageRedeem(): void {
    if (this.pageDataRedeem.length > 1) {
      this.mformRedeem.get('pageRedeem')?.setValue(this.mformRedeem.get('pageRedeem')?.value - 1);
    }
  }

  ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.unsubscribe();
  }

}
