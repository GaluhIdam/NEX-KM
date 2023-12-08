import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  faSearch,
  faBookOpen,
  faBullhorn,
  faGear,
  faEllipsis,
  faPlus,
  faPencil,
  faCheck,
  faXmark,
  faChevronRight,
  faPenToSquare,
  faEllipsisVertical,
  faClock,
  faPlane,
  faHeart,
  faPenRuler,
  faUserGroup,
  faLink,
  faComment,
  faComments,
  faEye,
  faBorderAll,
  faHouseUser,
  faUserPlus,
  faUserMinus,
  faPaperPlane,
} from '@fortawesome/free-solid-svg-icons';
import { Modal, Tab, Sidenav, initTE } from 'tw-elements';
import { faBell } from '@fortawesome/free-regular-svg-icons';
import { KeycloakService } from 'keycloak-angular';
import { HomePageService } from '../home-page/homepage.service';
import { UserListDTO } from '../home-page/dtos/user-list.dto';
import {
  Subject,
  Subscription,
  debounceTime,
  map,
  pipe,
  takeUntil,
  tap,
} from 'rxjs';
import { NexLevelService } from '../nex-level/nex-level.service';
import { PointDTO } from '../nex-level/dtos/point.dto';
import { MileDTO } from '../nex-level/dtos/mile.dto';
import { ToastrService } from 'ngx-toastr';
import { DashboardCategoryDTO } from './dtos/dashboard-category.dto';
import { LocalService } from 'src/app/core/services/local/local.service';
import { environment } from 'src/environments/environment.prod';
import {
  CreateFollowerFollowingDTO,
  FollowerFollowingDTO,
} from './dtos/follower-following.dto';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ForYourPageDTO } from '../home-page/dtos/for-your-page.dto';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import { PlyrComponent } from 'ngx-plyr';
import { WatchStoryDTO } from '../nex-learning/dtos/story.dto';
import { NexLearningService } from '../nex-learning/nex-learning.service';
import {
  CommunityDTO,
  CommunityUserDTO,
  RecentActivityDTO,
} from '../nex-community/dto/community.dto';
import { SoeService } from 'src/app/core/soe/soe.service';
import {
  LearningFuseDTO,
  MergeLearningDTO,
} from '../nex-learning/dtos/fuse.dto';
import { ActivatedRoute, Params, Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-user',
  templateUrl: './dashboard-user.component.html',
  styleUrls: ['./dashboard-user.component.css'],
})
export class DashboardUserComponent
  extends BaseController
  implements OnInit, OnDestroy
{
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
  faBorderAll = faBorderAll;
  faChevronRight = faChevronRight;
  faEllipsis = faEllipsis;
  faPenToSquare = faPenToSquare;
  faEllipsisVertical = faEllipsisVertical;
  faClock = faClock;
  faPlane = faPlane;
  faHeart = faHeart;
  faPenRuler = faPenRuler;
  faUserGroup = faUserGroup;
  faLink = faLink;
  faComment = faComment;
  faHouseUser = faHouseUser;
  faEye = faEye;
  faUserPlus = faUserPlus;
  faUserMinus = faUserMinus;
  faPaperPlane = faPaperPlane;
  faComments = faComments;

  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  //#region ------------ user profile -------------------
  user: UserListDTO | undefined;
  personalNumber: string;
  photoDefault: string;
  isUserLoading: boolean;
  //#endregion ------------ user profile ----------------

  //#region ------------ nex level ----------------------
  isNexLevelLoading: boolean;
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
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  point!: number;
  userLevelPoint: number;
  nameLevel: string;
  totalPoint: number;
  remainingPoint!: number;
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
    {
      name: 'Notifications',
    },
  ];

  selectedDashboardCategory: DashboardCategoryDTO;

  totalFollower!: number;
  totalFollowing!: number;
  followerList: FollowerFollowingDTO[] = [];
  followingList: FollowerFollowingDTO[] = [];
  pageFollower: number = 1;
  pageFollowing: number = 1;
  limitFollower: number = 10;
  limitFollowing: number = 10;

  urlAvatar: string = environment.httpUrl + '/v1/api/file-manager/avatar/';

  //Carousel Option
  customOptionsTwo: OwlOptions = {
    margin: 20,
    stagePadding: 10,
    autoplay: false,
    autoplayTimeout: 2000,
    autoplayHoverPause: false,
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: true,
    navSpeed: 600,
    navText: ['&#8249;', '&#8250;'],
    responsive: {
      0: {
        items: 2,
      },
      400: {
        items: 2,
      },
      720: {
        items: 3,
      },
      1000: {
        items: 3,
      },
    },
    nav: false,
  };

  communityUser: CommunityUserDTO[] = [];
  activityCommunity: RecentActivityDTO[] = [];
  totalActivityCommunity!: number;
  isFlying: boolean = false;
  fypData: ForYourPageDTO[] = [];
  page: number = 1;
  limit: number = 10;

  sideBar: boolean = false;
  search: string = '';

  showSearch: boolean = false;
  hideDropdownTimeout: any;

  resultBySearch: MergeLearningDTO[] = [];
  totalData: number = 0;
  pageData: Array<number> = [];
  timeTaken: number = 0;

  trendingSearch: LearningFuseDTO[] = [];
  suggestionSearch: LearningFuseDTO[] = [];
  searchByInterest: MergeLearningDTO[] = [];

  userList: UserListDTO[] = [];

  mform: FormGroup = new FormGroup({
    title: new FormControl('', [Validators.required]),
    search: new FormControl(this.search),
    page: new FormControl(this.page),
    limit: new FormControl(this.limit),
  });

  nav: string = 'FYP';

  constructor(
    readonly keycloakService: KeycloakService,
    private readonly homepageService: HomePageService,
    private readonly nexLevelService: NexLevelService,
    private readonly toastr: ToastrService,
    private readonly localService: LocalService,
    private readonly changeDetector: ChangeDetectorRef,
    private readonly nexLearningService: NexLearningService,
    private readonly soeService: SoeService,
    private elementRef: ElementRef,
    private readonly router: Router,
    private readonly activeRoute: ActivatedRoute
  ) {
    super(DashboardUserComponent.name);
    this.isUserLoading = false;
    this.isNexLevelLoading = false;
    this.userLevelPoint = 0;
    this.nameLevel = '';
    this.personalNumber = '';
    this.totalPoint = 0;
    this.dataMiles = [];
    this.remainingPointByDesimal = 0;
    this.remainingPointByPersen = 0;
    this.photoDefault = '../../../../../assets/image/empty-profile-image.jpeg';

    const selectedCategory = this.localService.getData(
      'selected_dashboard_category'
    );
    if (selectedCategory !== null) {
      this.selectedDashboardCategory = JSON.parse(selectedCategory);
    } else {
      this.selectedDashboardCategory = this.categoryData[0];
    }
  }

  obs!: Subscription;
  statusPage: boolean = true;
  personalNumberView!: string;

  @ViewChild('flippableImage') flippableImage: ElementRef | undefined;

  ngOnInit(): void {
    initTE({ Tab, Sidenav, Modal });
    this.initializeUserOptions();

    this.activeRoute.params.subscribe((params: Params) => {
      const personal_number = params['personal_number'];
      this.personalNumberView = personal_number;
      if (personal_number) {
        this.getUserData(personal_number);
        this.getUserDataPointNexLevel(personal_number);
        this.getDataCommunity(personal_number);
        this.getFollowerData(
          this.pageFollower,
          this.limitFollower,
          personal_number
        );
        this.getFollowingData(
          this.pageFollowing,
          this.limitFollowing,
          personal_number
        );
        this.getDataForYourPage(this.page, this.limit, personal_number);
        this.getDataActivityCommunity(personal_number, this.page, this.limit);
        this.statusPage = false;
        this.obs = this.mform.valueChanges
          .pipe(debounceTime(500))
          .subscribe((data) => {
            this.userList = [];
            this.getUserListData(data.page, data.limit, data.search, 'asc');
          });
      } else {
        this.statusPage = true;
        this.getUserData(this.keycloakService.getUsername());
        this.getUserDataPointNexLevel(this.keycloakService.getUsername());
        this.getDataCommunity(this.keycloakService.getUsername());
        this.getFollowerData(
          this.pageFollower,
          this.limitFollower,
          this.keycloakService.getUsername()
        );
        this.getFollowingData(
          this.pageFollowing,
          this.limitFollowing,
          this.keycloakService.getUsername()
        );
        this.getDataForYourPage(
          this.page,
          this.limit,
          this.keycloakService.getUsername()
        );
        this.getDataActivityCommunity(
          this.keycloakService.getUsername(),
          this.page,
          this.limit
        );

        this.obs = this.mform.valueChanges
          .pipe(debounceTime(500))
          .subscribe((data) => {
            this.userList = [];
            this.getUserListData(data.page, data.limit, data.search, 'asc');
          });
      }
    });
  }

  ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.unsubscribe();
  }

  //Show suggestion
  async showSuggestionSearchData(search: string): Promise<void> {
    try {
      const searchValue = this.mform.get('search')?.value;

      if (searchValue) {
        this.nexLearningService
          .showSuggestion(search)
          .pipe(
            map((data) => {
              return data.filter(
                (dtx) => dtx.search !== this.capitalizeWords(searchValue)
              );
            })
          )
          .subscribe((response) => {
            this.suggestionSearch = response;
          });
      }
    } catch (error) {
      throw error;
    }
  }

  async showResultBasedInterest(): Promise<void> {
    try {
      this.homepageService
        .getUserListByPersonalNumber(this.keycloakService.getUsername())
        .subscribe((response) => {
          const dataSearch: string[] = [];
          response.data.interestUser.forEach((data) => {
            dataSearch.push(data.interestList.name);
          });
          this.nexLearningService
            .showResultSearchByInterest(dataSearch)
            .pipe(
              tap((image) => {
                if (image) {
                  image.forEach((imageData) => {
                    imageData.path =
                      environment.httpUrl +
                      '/v1/api/file-manager/get-imagepdf/' +
                      imageData.path;
                  });
                }
              })
            )
            .subscribe((res) => (this.searchByInterest = res));
        });
    } catch (error) {
      throw error;
    }
  }

  ngAfterViewInit(): void {
    this.changeDetector.detectChanges();
  }

  //GET Personal Number from Keycloak
  private initializeUserOptions(): void {
    this.personalNumber = this.keycloakService.getUsername();
  }

  //Get Personal Info from SOE
  private getUserData(personalNumber: string): void {
    this.isUserLoading = true;
    this.homepageService
      .getUserListByPersonalNumber(personalNumber)
      .pipe(
        tap((data) => {
          data.data.userPhoto =
            environment.httpUrl +
            '/v1/api/file-manager/get-imagepdf/' +
            data.data.userPhoto;
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe(
        (response) => {
          this.isUserLoading = false;
          this.user = response.data;
        },
        (error) => {
          this.isUserLoading = false;
        }
      );
  }

  //Get Point Next Level User
  getUserDataPointNexLevel(personalNumber: string): void {
    try {
      this.nexLevelService
        .getPointByPersonalNumber(personalNumber)
        .subscribe((response) => {
          if (response.data) {
            this.dataPoint = response.data;
            this.userLevelPoint = response.data?.totalPoint;
          }
          this.nexLevelService
            .getAllMile()
            .pipe(
              tap((data) => {
                if (data.data.result) {
                  data.data.result.forEach((subdata) => {
                    subdata.path =
                      environment.httpUrl +
                      '/v1/api/file-manager/get-imagepdf/' +
                      subdata.path;
                  });
                }
              })
            )
            .pipe(
              tap((mile) => {
                this.dataMiles = mile.data.result;
                if (this.dataMiles) {
                  this.dataMiles.forEach((mileData) => {
                    const isPointInRange =
                      this.dataPoint.totalPoint >= mileData.minPoint &&
                      this.dataPoint.totalPoint <= mileData.maxPoint &&
                      mileData.status;

                    if (isPointInRange) {
                      const curEst = this.userLevelPoint - mileData.minPoint;
                      const estMaxMin = mileData.maxPoint - mileData.minPoint;
                      const ce = curEst / estMaxMin;
                      const barPercent = ce * 100;
                      this.totalPoint = barPercent;
                      this.remainingPointByPersen = 100 - this.totalPoint;
                      this.remainingPoint =
                        mileData.maxPoint - this.userLevelPoint;
                    }
                  });
                }
              })
            )
            .subscribe((response) => (this.dataMiles = response.data.result));
        });
    } catch (error) {
      throw error;
    }
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
    this.localService.saveData(
      'selected_dashboard_category',
      JSON.stringify(category)
    );

    this.selectedDashboardCategory = category;
  }

  async getFollowerData(
    page: number,
    limit: number,
    personalNumber: string
  ): Promise<void> {
    this.homepageService
      .getFollower(page, limit, personalNumber)
      .subscribe((response) => {
        this.followerList = response.data.result;
        this.totalFollower = response.data.total;
      });
  }

  async getFollowingData(
    page: number,
    limit: number,
    personalNumber: string
  ): Promise<void> {
    this.homepageService
      .getFollowing(page, limit, personalNumber)
      .subscribe((response) => {
        this.followingList = response.data.result;
        this.totalFollowing = response.data.total;
      });
  }

  async deleteFollowerFollowing(uuid: string): Promise<void> {
    try {
      this.homepageService.deleteFollower(uuid).subscribe(() => {
        this.getFollowerData(
          this.pageFollower,
          this.limitFollower,
          this.keycloakService.getUsername()
        );
        this.getFollowingData(
          this.pageFollowing,
          this.limitFollowing,
          this.keycloakService.getUsername()
        );
      });
    } catch (error) {
      throw error;
    }
  }

  startFlying() {
    this.isFlying = true;
  }
  stopFlying() {
    this.isFlying = false;
  }

  async getDataForYourPage(
    page: number,
    limit: number,
    personalNumber: string
  ): Promise<void> {
    try {
      this.homepageService
        .getForYourPage(page, limit, personalNumber)
        .subscribe((response) => (this.fypData = response.data.result));
    } catch (error) {
      throw error;
    }
  }

  async followerCheck(follower: string, following: string): Promise<void> {
    try {
      this.homepageService.followerChecker(follower, following).subscribe();
    } catch (error) {
      throw error;
    }
  }

  isFollowing(fyp: string): boolean {
    return this.followingList.some(
      (data) => data.personalNumberFollowing === fyp
    );
  }

  isFollower(personalNumber: string): boolean {
    return this.followerList.some(
      (data) => data.personalNumberFollowing === personalNumber
    );
  }

  plyr!: PlyrComponent;
  player!: Plyr;

  play(): void {
    this.player.play(); // or this.plyr.player.play()
  }

  pause(): void {
    this.player.pause(); // or this.plyr.player.play()
  }

  stop(): void {
    this.player.stop(); // or this.plyr.player.stop()
  }

  played(uuid: string, idContent: number, category: string) {
    if (category == 'story') {
      this.addViewStory(uuid, this.keycloakService.getUsername(), idContent);
    }
  }

  async addViewStory(
    uuid: string,
    personalNumber: string,
    storyId: number
  ): Promise<void> {
    const dto: WatchStoryDTO = {
      personalNumber: personalNumber,
      storyId: storyId,
    };
    this.nexLearningService
      .watchStory(uuid, personalNumber, storyId, dto)
      .subscribe();
  }

  async followeUnFollow(
    personalNumberFollower: string,
    personalNumberFollowing: string
  ): Promise<void> {
    try {
      const dto: CreateFollowerFollowingDTO = {
        personalNumberFollower: personalNumberFollower,
        personalNumberFollowing: personalNumberFollowing,
      };
      this.homepageService.createFollowerFollowing(dto).subscribe(() => {
        this.getFollowerData(
          this.pageFollower,
          this.limitFollower,
          this.personalNumberView == null
            ? this.keycloakService.getUsername()
            : this.personalNumberView
        );
        this.getFollowingData(
          this.pageFollowing,
          this.limitFollowing,
          this.personalNumberView == null
            ? this.keycloakService.getUsername()
            : this.personalNumberView
        );
      });
    } catch (error) {
      throw error;
    }
  }

  async getDataCommunity(personalNumber: string): Promise<void> {
    try {
      this.homepageService
        .getCommunityUser(personalNumber)
        .pipe(
          tap((data) => {
            data.data.forEach((subdata) => {
              subdata.communityMembersCommunities.icon =
                environment.httpUrl +
                '/v1/api/file-manager/get-imagepdf/' +
                subdata.communityMembersCommunities.icon;
            });
          })
        )
        .subscribe((response) => {
          this.communityUser = response.data;
        });
    } catch (error) {
      throw error;
    }
  }

  async getDataActivityCommunity(
    personalNumber: string,
    page: number,
    limit: number
  ): Promise<void> {
    try {
      this.homepageService
        .getActivityCommunityByUser(personalNumber, page, limit)
        .subscribe((response) => {
          this.activityCommunity = response.data.result;
          this.totalActivityCommunity = response.data.total;
        });
    } catch (error) {
      throw error;
    }
  }

  sideBarX(): void {
    this.sideBar = !this.sideBar;
    console.log(this.sideBar);
  }

  async showResultBySearchEngine(
    search: string,
    page: number,
    limit: number
  ): Promise<void> {
    try {
      const startTime = performance.now();
      this.onInputBlur();
      this.nexLearningService
        .showResultSearch(search, page, limit)
        .pipe(
          tap((data) => {
            if (data.data.result) {
              data.data.result.forEach((image) => {
                image.path =
                  environment.httpUrl +
                  '/v1/api/file-manager/get-imagepdf/' +
                  image.path;
              });
            }
          }),
          tap((data) => {
            data.data.result.forEach((image) => {
              this.soeService
                .getUserData(image.personalNumber)
                .subscribe(
                  (response) => (image.personalNumber = response.personalName)
                );
            });
          })
        )
        .subscribe((response) => {
          this.resultBySearch = response.data.result;
          this.totalData = response.data.total;
          this.paginate(this.totalData, this.limit, this.pageData);
          this.elementRef.nativeElement.querySelector('input').blur();
          const endTime = performance.now();
          this.timeTaken = endTime - startTime;
        });
    } catch (error) {
      throw error;
    }
  }

  onInputFocus() {
    this.showSearch = true;
    clearTimeout(this.hideDropdownTimeout);
  }

  onInputBlur() {
    this.hideDropdownTimeout = setTimeout(() => {
      this.showSearch = false;
    }, 250);
  }

  //Category Checker & Routing content
  routingContent(uuid: string, filePath: string): void {
    const path = filePath.replace(
      environment.httpUrl + '/v1/api/file-manager/get-imagepdf/',
      ''
    );
    const segments = path.split('/');
    if (segments.length > 0) {
      const category = segments[0];
      if (category == 'article') {
        this.router.navigate(['user/nex-learning/article/' + uuid]);
        window.scrollTo(0, 0);
      }
      if (category == 'best-practice') {
        this.router.navigate(['user/nex-learning/best-practice/' + uuid]);
        window.scrollTo(0, 0);
      }
      if (category == 'story') {
        this.router.navigate(['user/nex-learning/story-view/' + uuid]);
        window.scrollTo(0, 0);
      }
    }
  }

  setValueSearch(value: string): void {
    this.mform.get('search')?.setValue(value);
    this.showResultBySearchEngine(value, this.page, this.limit);
  }

  getSuggestionCharacters(suggestion: string): string[] {
    return suggestion.split('');
  }

  highlightMatchingCharacters(suggestion: string, search: string): string {
    const suggestionChars = this.getSuggestionCharacters(suggestion);
    const searchChars = this.getSuggestionCharacters(search.toLowerCase());

    const highlightedChars = suggestionChars.map((char, index) => {
      if (searchChars.includes(char.toLowerCase())) {
        return `<span class="font-semibold text-primary">${char}</span>`;
      }
      return char;
    });

    return highlightedChars.join('');
  }

  trendingClick(search: string): void {
    this.mform.get('search')?.setValue(search);
    this.showResultBySearchEngine(
      this.mform.get('search')?.value,
      this.mform.get('page')?.value,
      this.limit
    );
  }

  async getUserListData(
    page: number,
    limit: number,
    search: string,
    sortBy: string
  ): Promise<void> {
    this.homepageService
      .getUserList(page, limit, search, sortBy)
      .subscribe((response) => {
        this.userList = response.data.result;
      });
  }
  navTab(nav: string): void {
    this.nav = nav;
  }

  navigateToUser(personalNumber: string): void {
    this.router.navigate([`/user/dashboard-user/`, personalNumber]);
  }
}
