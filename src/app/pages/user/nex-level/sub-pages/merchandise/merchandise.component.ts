import { HomePageService } from 'src/app/pages/user/home-page/homepage.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import { NexLevelService } from '../../nex-level.service';
import { KeycloakService } from 'keycloak-angular';
import { SoeService } from 'src/app/core/soe/soe.service';
import { environment } from 'src/environments/environment.prod';
import { EMPTY, Observable, Subject, Subscription, catchError, debounceTime, map, of, switchMap, takeUntil, tap } from 'rxjs';
import { MerchandiseDTO } from '../../dtos/merchandise.dto';
import {
  faEllipsis,
  faChevronRight,
  faPlus,
  faWallet,
  faChevronLeft,
  faCircleChevronLeft,
  faCircleChevronRight,
  faFilter,
  faStar,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import { FormControl, FormGroup } from '@angular/forms';
import { RedeemCreateDTO } from '../../dtos/redeem.dto';
import Swal from 'sweetalert2';
import { PointDTO } from '../../dtos/point.dto';
import Shepherd from 'shepherd.js';
import { LocalService } from 'src/app/core/services/local/local.service';
import { guideNexLevelMerchandise } from 'src/app/core/const/guide/tour-guide.const';
import { SocketService } from 'src/app/core/utility/socket-io-services/socket.io.service';
import { NotificationRequestDTO } from '../../../home-page/dtos/notification.dto';

@Component({
  selector: 'app-merchandise',
  templateUrl: './merchandise.component.html',
  styleUrls: ['./merchandise.component.css'],
})
export class MerchandiseComponent
  extends BaseController
  implements OnInit, OnDestroy {

  constructor(
    private readonly nexlevelService: NexLevelService,
    private readonly keycloakService: KeycloakService,
    private readonly soeService: SoeService,
    private readonly localService: LocalService,
    private readonly webSocket: SocketService,
    private readonly homepageService: HomePageService
  ) {
    super(MerchandiseComponent.name);
    this.showTooltips = [];
    this.tableColumnHovers = new Array(17).fill(false);
  }

  private readonly unsubscribe$ = new Subject();
  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  // Font Awesome
  faChevronRight = faChevronRight;
  faChevronLeft = faChevronLeft;
  faCircleChevronRight = faCircleChevronRight;
  faCircleChevronLeft = faCircleChevronLeft;
  faEllipsis = faEllipsis;
  faPlus = faPlus;
  faWallet = faWallet;
  faStar = faStar;
  faFilter = faFilter;
  faSearch = faSearch;

  // tourGuide
  tour = new Shepherd.Tour({
    defaultStepOptions: {
      scrollTo: { behavior: 'smooth', block: 'center' },
    },
    useModalOverlay: true,
  });

  // inisialisasi
  obs!: Subscription;
  currentDate = new Date();
  showTooltips: boolean[];
  tableColumnHovers: boolean[];
  personalName!: string;
  dataMerchandise: MerchandiseDTO[] = [];
  recentMerchandise: MerchandiseDTO = {
    _count: 0,
    id: 0,
    uuid: '',
    personalNumber: '',
    title: '',
    description: '',
    qty: 0,
    point: 0,
    isPinned: false,
    createdAt: this.currentDate,
    updatedAt: this.currentDate,
    imageMerchandise: []
  };
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
  selectPointFilter!: number | null;
  isSort: 'ascPoint' | 'descPoint' | null = null;
  pointFilter: any[] = [
    { id: 1, minPoint: 0, maxPoint: 1000 },
    { id: 2, minPoint: 1000, maxPoint: 2000 },
    { id: 3, minPoint: 2000, maxPoint: 3000 },
  ];

  // Paginator
  page: number = 1;
  limit: number = 12;
  search: string = '';
  sortBy: string = 'desc';
  optionx: string = 'false';
  totalData: number = 0;
  pageData: Array<number> = [];

  // mformMerchandise
  mform: FormGroup = new FormGroup({
    search: new FormControl(''),
    page: new FormControl(this.page),
    limit: new FormControl(this.limit),
    sortBy: new FormControl(this.isSort == null ? 'desc' : this.isSort),
  });

  ngOnInit(): void {
    this.getUser(this.keycloakService.getUsername());
    this.getFirst(this.page, this.limit, this.search, this.sortBy);
    this.getDataPoint(this.keycloakService.getUsername());
    this.getDataMerchandise(this.page, this.limit, this.search, this.sortBy);
    this.obs = this.mform.valueChanges
      .pipe(debounceTime(500))
      .subscribe((data) => {
        if (data.page < 1) {
          data.page < 1 ? this.mform.get('page')?.setValue(1) : data.page;
        } else {
          this.getDataMerchandise(data.page, data.limit, data.search, data.sortBy);
        }
      });
    this.tour.addStep({
      id: 'merchandise-step',
      title: 'Merchandise',
      text: 'You can see all the merchandise and filter them according to your preferences',
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
      id: 'merchandise-step-1',
      title: 'Jumbotron',
      text: 'You can view the latest merchandise and redeem it according to the points you have',
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
    this.tour.on('cancel', this.onCancelTour.bind(this));
    this.tour.on('complete', this.removeTourMarkLevel.bind(this));
    if (localStorage.getItem(guideNexLevelMerchandise.MODULE)) {
    } else {
      this.tour.start();
    }
  }

  removeTourMarkLevel() {
    this.localService.removeData(guideNexLevelMerchandise.MODULE);
    this.onCancelTour();
  }

  onCancelTour() {
    this.localService.saveData(guideNexLevelMerchandise.MODULE, JSON.stringify(true));
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
          this.personalName = result.personalName
        )),
        takeUntil(this.unsubscribe$)
      )
      .subscribe();
  }

  // getJumbroton
  getFirst(
    page: number,
    limit: number,
    search: string,
    sortBy: string
  ): void {
    this.nexlevelService.getMerchandise(page, limit, search, sortBy)
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
        switchMap((response) => {
          if (response.data.result) {
            this.recentMerchandise = response.data.result[0];
            return Observable.create();
          }
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe()
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

  // filterMerchandise
  filterMerchandise(
    page: number,
    limit: number,
    search: string,
    sortBy: string,
    minPoint: number,
    maxPoint: number
  ): void {
    this.nexlevelService.filterMerchandise(page, limit, search, sortBy, minPoint, maxPoint)
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
            })
          }
        }),
        switchMap((response) => {
          this.dataMerchandise = response.data.result;
          this.totalData = response.data.total;
          this.paginate(this.totalData, this.limit, this.pageData);
          return Observable.create();
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe();
  }

  filterPt(event: any): void {
    if (event === 'ascPoint' || event === 'descPoint') {
      this.getDataMerchandise(this.page, this.limit, this.search, event);
    }
    this.pointFilter.forEach((data) => {
      if (event === data.id) {
        this.filterMerchandise(
          this.page,
          this.limit,
          this.search,
          this.sortBy,
          data.minPoint,
          data.maxPoint
        );
      }
    });
  }

  clearFilter(): void {
    this.selectPointFilter = null;
    this.isSort = null;
    this.getDataMerchandise(this.page, this.limit, this.search, this.sortBy);
  }

  nextPage(): void {
    if (this.pageData.length > 1) {
      this.mform.get('page')?.setValue(this.mform.get('page')?.value + 1);
    }
  }

  prevPage(): void {
    if (this.pageData.length > 1) {
      this.mform.get('page')?.setValue(this.mform.get('page')?.value - 1);
    }
  }

  // redeemProduct
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
                contentType: 'redeem',
                contentUuid: 'nice'
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
                Swal.fire({
                  icon: 'success',
                  title: 'Success!',
                  text: 'Your merchandise was successfully created.',
                  timer: 1000,
                  showConfirmButton: false,
                }).then(() => { });
              });
            });
        }
      });
    } catch (error) {
      throw error;
    }
  }

  //Get Point
  getDataPoint(personalNumber: string): void {
    this.nexlevelService.getPointByPersonalNumber(personalNumber)
      .pipe(
        catchError((err) => {
          console.error(err);
          err('error', err);
          return EMPTY;
        }),
        tap((data) => {
          this.dataPoint = data.data;
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.unsubscribe();
  }
}
