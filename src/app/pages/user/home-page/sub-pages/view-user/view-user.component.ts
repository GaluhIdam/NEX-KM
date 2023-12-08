import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import {
  faSearch,
  faBookOpen,
  faBullhorn,
  faBell,
  faGear,
  faPencil,
  faPlus,
  faCheck,
  faXmark,
  faChevronRight,
  faEllipsis,
  faPenToSquare,
  faEllipsisVertical,
  faClock,
} from '@fortawesome/free-solid-svg-icons';
import { Subject, takeUntil, tap } from 'rxjs';
import { UserListDTO } from '../../dtos/user-list.dto';
import { PointDTO } from '../../../nex-level/dtos/point.dto';
import { MileDTO } from '../../../nex-level/dtos/mile.dto';
import { DashboardCategoryDTO } from '../../dtos/dashboard-category.dto';
import { ActivatedRoute, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { HomePageService } from '../../homepage.service';
import { SoeService } from 'src/app/core/soe/soe.service';
import { HeaderService } from 'src/app/core/services/header/header.service';
import { NexLevelService } from '../../../nex-level/nex-level.service';
import { ToastrService } from 'ngx-toastr';
import { LocalService } from 'src/app/core/services/local/local.service';
import {
  Chip,
  Modal,
  Collapse,
  Dropdown,
  Ripple,
  Input,
  initTE,
} from 'tw-elements';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-view-user',
  templateUrl: './view-user.component.html',
  styleUrls: ['./view-user.component.css'],
})
export class ViewUserComponent implements OnInit, OnDestroy {
  linked_icon = '../../../../assets/image/footer/linked-icon.png';
  instagram_icon = '../../../../assets/image/footer/instagram-icon.png';
  facebook_icon = '../../../../assets/image/fb.png';
  bg_library = '../../../../assets/image/library/bg-library.jpg';
  faSearch = faSearch;
  faBookOpen = faBookOpen;
  faBullhorn = faBullhorn;
  faBell = faBell;
  faGear = faGear;
  faPencil = faPencil;
  faPlus = faPlus;
  faCheck = faCheck;
  faXmark = faXmark;
  faChevronRight = faChevronRight;
  faEllipsis = faEllipsis;
  faPenToSquare = faPenToSquare;
  faEllipsisVertical = faEllipsisVertical;
  faClock = faClock;

  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  //#region ------------ user profile -------------------
  user: UserListDTO | undefined;
  personalNumber: string | null;
  photoDefault: string;
  isUserLoading: boolean;
  //#endregion ------------ user profile ----------------

  //#region ------------ nex level ----------------------
  isNexLevelLoading: boolean;
  dataPoint: PointDTO | undefined;
  userLevelPoint: number;
  nameLevel: string;
  totalPoint: number;
  dataMiles: MileDTO[];
  remainingPointByPersen: number;
  remainingPointByDesimal: number;
  //#endregion --------- nex level ----------------------
  totalFeeds: number = 0;

  categoryData: DashboardCategoryDTO[] = [
    {
      name: 'Feeds',
    },
    {
      name: 'Sharing Experiences',
    },
  ];

  selectedDashboardCategory: DashboardCategoryDTO;

  constructor(
    private readonly router: Router,
    private keycloakService: KeycloakService,
    private readonly route: ActivatedRoute,
    private readonly homepageService: HomePageService,
    private readonly soeService: SoeService,
    private headerService: HeaderService,
    private readonly nexLevelService: NexLevelService,
    private readonly toastr: ToastrService,
    private readonly localService: LocalService,
    private readonly changeDetector: ChangeDetectorRef,
    private readonly location: Location
  ) {
    this.personalNumber = this.route.snapshot.paramMap.get('personal_number');

    this.isUserLoading = false;
    this.isNexLevelLoading = false;
    this.userLevelPoint = 0;
    this.nameLevel = '';

    this.totalPoint = 0;
    this.dataMiles = [];
    this.remainingPointByDesimal = 0;
    this.remainingPointByPersen = 0;
    this.photoDefault =
      'https://st3.depositphotos.com/1767687/16607/v/450/depositphotos_166074422-stock-illustration-default-avatar-profile-icon-grey.jpg';

    this.selectedDashboardCategory = this.categoryData[0];
  }

  ngOnInit(): void {
    initTE({ Chip, Modal, Collapse, Dropdown, Ripple, Input });

    if (this.personalNumber) {
      this.getUserData(this.personalNumber);
      this.getUserDataPointNexLevel(this.personalNumber);
    }
  }

  ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.changeDetector.detectChanges();
  }

  //Get Personal Info from SOE
  private getUserData(personalNumber: string): void {
    this.isUserLoading = true;
    this.homepageService
      .getUserListByPersonalNumber(personalNumber)
      .pipe(tap((data) => {
        data.data.userPhoto =
          environment.httpUrl +
          '/v1/api/file-manager/get-imagepdf/' +
          data.data.userPhoto;
      }), takeUntil(this._onDestroy$))
      .subscribe(
        (response) => {
          this.isUserLoading = false;
          this.user = response.data;
          if (!this.user) {
            this.showAlertNoUser();
          }
        },
        (error) => {
          this.isUserLoading = false;
        }
      );
  }

  //Get Point Next Level User
  getUserDataPointNexLevel(personalNumber: string): void {
    this.isNexLevelLoading = true;
    this.nexLevelService.getPointByPersonalNumber(personalNumber).subscribe(
      (response) => {
        this.dataPoint = response.data;
        this.userLevelPoint = response.data?.totalPoint ?? 0;
        this.nexLevelService
          .getAllMile()
          .pipe(takeUntil(this._onDestroy$))
          .subscribe(
            (mile) => {
              this.isNexLevelLoading = false;
              this.dataMiles = mile.data.result;
              if (mile.data.result) {
                mile.data.result.map((mileData) => {
                  if (
                    response.data?.totalPoint >= mileData.minPoint &&
                    response.data?.totalPoint <= mileData.maxPoint
                  ) {
                    this.nameLevel = mileData.name;

                    //Total Point Earn
                    this.totalPoint =
                      ((response.data?.totalPoint - mileData.minPoint) /
                        (mileData.maxPoint - mileData.minPoint)) *
                      100;

                    //Remaining Point
                    this.remainingPointByPersen =
                      ((mileData.maxPoint - response.data?.totalPoint) /
                        (mileData.maxPoint - mileData.minPoint)) *
                      100;
                  }
                });
              }
            },
            (error) => {
              this.isNexLevelLoading = false;
            }
          );
      },
      (error) => {
        this.isNexLevelLoading = false;
      }
    );
  }

  onGotoInstagramPage(username: string | null) {
    if (username !== null) {
      window.open('https://www.instagram.com/' + username, '_blank');
    } else {
      this.toastr.info('User dont have instagram account', 'Information');
    }
  }

  onGotoLinkedinPage(username: string | null) {
    if (username !== null) {
      window.open('https://www.linkedin.com/in/' + username, '_blank');
    } else {
      this.toastr.info('User dont have linkedin account', 'Information');
    }
  }

  onGotoFacebookPage(username: string | null) {
    if (username !== null) {
      window.open('https://www.facebook.com/' + username, '_blank');
    } else {
      this.toastr.info('User dont have facebook account', 'Information');
    }
  }

  onChangeDashboardCategory(category: DashboardCategoryDTO): void {
    this.selectedDashboardCategory = category;
  }

  showAlertNoUser(): void {
    Swal.fire({
      icon: 'info',
      title: 'Information Alert',
      text: "This user don't have data user in user list Nex KM",
      confirmButtonColor: '#3085d6',
      showConfirmButton: true,
      confirmButtonText: 'Back to previous page',
    }).then((result) => {
      if (result.isConfirmed) {
        this.location.back();
      }
    });
  }
}
