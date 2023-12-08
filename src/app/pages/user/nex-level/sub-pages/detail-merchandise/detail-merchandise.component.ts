import { HomePageService } from 'src/app/pages/user/home-page/homepage.service';
import { NexLevelService } from 'src/app/pages/user/nex-level/nex-level.service';
import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MerchandiseDTO } from '../../dtos/merchandise.dto';
import { EMPTY, Observable, Subject, Subscription, catchError, switchMap, takeUntil, tap } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { KeycloakService } from 'keycloak-angular';
import { RedeemCreateDTO, RedeemDTO } from '../../dtos/redeem.dto';
import { SoeService } from 'src/app/core/soe/soe.service';
import { PointDTO } from '../../dtos/point.dto';
import Shepherd from 'shepherd.js';
import { LocalService } from 'src/app/core/services/local/local.service';
import { guideNexLevelDetail } from 'src/app/core/const/guide/tour-guide.const';
import { SocketService } from 'src/app/core/utility/socket-io-services/socket.io.service';
import { NotificationRequestDTO } from '../../../home-page/dtos/notification.dto';

@Component({
  selector: 'app-detail-merchandise',
  templateUrl: './detail-merchandise.component.html',
  styleUrls: ['./detail-merchandise.component.css'],
})
export class DetailMerchandiseComponent implements OnInit, OnDestroy {

  constructor(
    private readonly router: Router,
    private readonly NexLevelService: NexLevelService,
    private readonly route: ActivatedRoute,
    private readonly keycloakService: KeycloakService,
    private readonly soeService: SoeService,
    private readonly localService: LocalService,
    private readonly websocket: SocketService,
    private readonly homepageService: HomePageService
  ) { }

  private readonly unsubscribe$ = new Subject();
  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  // inisialisasi
  merchandise: MerchandiseDTO | undefined;
  uuid!: string;
  totalData: number = 0;
  pageData: Array<number> = [];
  obs!: Subscription;
  id!: number | null;
  addOredit!: boolean;
  head!: string;
  personalName!: string;
  currentDate = new Date();
  image!: File | null;
  imageShow!: string | null;
  imageValidator: boolean | null = null;
  imageValidatorMessage!: string;
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
  RedeemData: RedeemDTO[] = [];

  // paginator
  page: number = 1;
  limit: number = 5;
  sortBy: string = 'desc';
  search: string = '';

  // tourGuide
  tour = new Shepherd.Tour({
    defaultStepOptions: {
      scrollTo: { behavior: 'smooth', block: 'center' },
    },
    useModalOverlay: true,
  });

  mform: FormGroup = new FormGroup({
    search: new FormControl(''),
    page: new FormControl(this.page),
    limit: new FormControl(this.limit),
    sortBy: new FormControl(this.sortBy),
  });

  submitForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    image: new FormControl(''),
    description: new FormControl('', [Validators.required]),
    qty: new FormControl('', [Validators.required]),
    point: new FormControl('', [Validators.required]),
    isPinned: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    this.getUser(this.keycloakService.getUsername());
    this.getDataPoint(this.keycloakService.getUsername());
    const _uuid: any = this.route.snapshot.paramMap.get('uuid')
    this.uuid = _uuid;
    this.getMerchandiseByUuid(this.uuid)
    this.tour.addStep({
      id: 'detail-step',
      title: 'Detail Merchandise',
      text: 'You can see information related to the merchandise you want',
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
      id: 'detail-step-1',
      title: 'Images Merchandise',
      text: 'Here, you can see other pictures of this merchandise',
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
      id: 'detail-step-2',
      title: 'Redeem Merchandise',
      text: 'Here, you can see other pictures of this merchandise,you can redeem merchandise and check its status on the front page of NEX Miles',
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
    this.tour.on('cancel', this.onCancelTour.bind(this));
    this.tour.on('complete', this.removeTourMarkLevel.bind(this));
    if (localStorage.getItem(guideNexLevelDetail.MODULE)) {
    } else {
      this.tour.start();
    }
  }

  removeTourMarkLevel() {
    this.localService.removeData(guideNexLevelDetail.MODULE);
    this.onCancelTour();
  }

  onCancelTour() {
    this.localService.saveData(guideNexLevelDetail.MODULE, JSON.stringify(true));
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

  // getMerchandiseByUuid
  getMerchandiseByUuid(uuid: string): void {
    this.NexLevelService.getMerchandiseByUuid(uuid)
      .pipe(
        catchError((err) => {
          console.error(err);
          err('error', err);
          return EMPTY;
        }),
        tap((data) => {
          if (data.data) {
          }
        }),
        switchMap((response) => {
          this.merchandise = response.data;
          this.merchandise.imageMerchandise.map((image) => {
            image.path = environment.httpUrl + '/v1/api/file-manager/get-imagepdf/' + image.path;
          });
          return Observable.create();
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe()
  }

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
              this.websocket.sendSocket(socket).subscribe()
              this.homepageService.createNotification(socket).subscribe()
              const dto: RedeemCreateDTO = {
                merchandiseId: merchandiseId,
                personalNumber: this.keycloakService.getUsername(),
                personalName: response.personalName,
                personalUnit: response.personalUnit,
                personalEmail: response.personalEmail,
              };
              this.NexLevelService.createRedeem(dto).subscribe(() => {
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

  merchandisePage(): void {
    this.router.navigate(['/user/nex-level/merchandise']);
  }

  changeImage(index: number): void {
    const mainImage = document.getElementById('mainImage') as HTMLImageElement;
    if (this.merchandise?.imageMerchandise) {
      if (index >= 0 && index < this.merchandise.imageMerchandise.length) {
        mainImage.src = this.merchandise.imageMerchandise[index].path;
        mainImage.alt = `image_${index}`;
      }
    }
  }

  //Get Point
  getDataPoint(personalNumber: string): void {
    this.NexLevelService.getPointByPersonalNumber(personalNumber)
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
    this._onDestroy$.next(true)
    this._onDestroy$.unsubscribe
  }

}
