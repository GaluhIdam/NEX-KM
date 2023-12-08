import { BaseController } from 'src/app/core/BaseController/base-controller';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  faArrowRight,
  faBell,
  faGear,
  faSearch,
  faFilter,
  faPrint,
  faCircleCheck,
  faEye,
  faStar,
  faBan,
  faXmark,
  faPencil,
  faPlus,
  faTrash,
  faBookmark,
  faCircleChevronLeft,
  faCircleChevronRight,
  faSadTear,
} from '@fortawesome/free-solid-svg-icons';
import { Title } from '@angular/platform-browser';
import {
  ActivatedRoute,
  NavigationEnd,
  NavigationExtras,
  Router,
} from '@angular/router';
import { Subscription, debounceTime, filter } from 'rxjs';
import { Modal, Ripple, initTE } from 'tw-elements';
import { NexLearningService } from 'src/app/pages/user/nex-learning/nex-learning.service';
import {
  StoryDTO,
  StoryStatusDTO,
} from 'src/app/pages/user/nex-learning/dtos/story.dto';
import { FormControl, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
import { KeycloakService } from 'keycloak-angular';
import { StatisticArticleDTO } from 'src/app/pages/user/nex-learning/dtos/articles.dto';

@Component({
  selector: 'app-inspiration-story',
  templateUrl: './inspiration-story.component.html',
  styleUrls: ['./inspiration-story.component.css'],
})
export class InspirationStoryComponent
  extends BaseController
  implements OnInit, OnDestroy
{
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private readonly nexlearningService: NexLearningService,
    private readonly keycloackService: KeycloakService
  ) {
    super(InspirationStoryComponent.name);
    this.initTitle();
    this.getChild(activatedRoute);
  }
  obs!: Subscription;

  faArrowRight = faArrowRight;
  faBell = faBell;
  faGear = faGear;
  faSearch = faSearch;
  faFilter = faFilter;
  faPrint = faPrint;
  faCircleCheck = faCircleCheck;
  faEye = faEye;
  faStar = faStar;
  faBan = faBan;
  faXmark = faXmark;
  faPencil = faPencil;
  faPlus = faPlus;
  faTrash = faTrash;
  faBookmark = faBookmark;
  faCircleChevronLeft = faCircleChevronLeft;
  faCircleChevronRight = faCircleChevronRight;
  faSadTear = faSadTear;

  statistic: StatisticArticleDTO = {
    allTime: 0,
    thisMonth: 0,
    published: 0,
    needApproval: 0,
    percent: 0,
  };

  title: any;

  page: number = 1;
  limit: number = 10;
  search: string = '';
  sortBy: string = 'trending';
  category: string = 'Inspirational';
  totalData: number = 0;
  pageData: Array<number> = [];
  descStatus: string | null = null;

  isAdmin: string = 'true';
  storyData: Array<StoryDTO> = [];

  mform: FormGroup = new FormGroup({
    search: new FormControl(''),
    page: new FormControl(this.page),
    limit: new FormControl(this.limit),
  });

  ngOnInit(): void {
    initTE({ Modal, Ripple });
    this.getStatistic();
    this.getStory(
      this.page,
      this.limit,
      this.search,
      this.category,
      this.sortBy,
      this.isAdmin
    );
    this.obs = this.mform.valueChanges
      .pipe(debounceTime(500))
      .subscribe((data) => {
        if (data.page < 1) {
          data.page < 1 ? this.mform.get('page')?.setValue(1) : data.page;
        } else {
          this.getStory(
            data.page,
            data.limit,
            data.search,
            this.category,
            this.sortBy,
            this.isAdmin
          );
        }
      });
  }

  ngOnDestroy(): void {
    this.obs.unsubscribe();
  }
  //Title Set
  initTitle(): void {
    this.activatedRoute.data.subscribe((data) => {
      this.title = data;
    });
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        var rt = this.getChild(this.activatedRoute);

        rt.data.subscribe((data: { title: string }) => {
          this.titleService.setTitle('Nex ' + data.title);
        });
      });
  }
  getChild(activatedRoute: ActivatedRoute): any {
    if (activatedRoute.firstChild) {
      return this.getChild(activatedRoute.firstChild);
    } else {
      return activatedRoute;
    }
  }

  directEdit() {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        edit_status: true,
      },
    };
    this.router.navigate(
      ['admin/detail-inspirational-story'],
      navigationExtras
    );
  }

  //Get Data Stroy
  getStory(
    page: number,
    limit: number,
    search: string,
    category: string,
    sortBy: string,
    isAdmin: string
  ): void {
    try {
      this.nexlearningService
        .getStory(page, limit, search, category, sortBy, isAdmin)
        .subscribe((response) => {
          this.storyData = response.data.result;
          this.totalData = response.data.total;
          this.paginate(response.data.total, this.limit, this.pageData);
        });
    } catch (error) {
      throw error;
    }
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

  onFormData(data: any): void {
    this.descStatus = data.descStatus;
  }

  async approveReject(uuid: string, status: boolean): Promise<void> {
    try {
      this.nexlearningService
        .getUser(this.keycloackService.getUsername())
        .subscribe((data) => {
          const dto: StoryStatusDTO = {
            approvalStatus: status,
            approvalDesc: this.descStatus == '' ? null : this.descStatus,
            approvalBy: data.personalName,
          };
          this.nexlearningService
            .approveRejectStory(uuid, dto)
            .subscribe(() => {
              if (status) {
                Swal.fire({
                  icon: 'success',
                  title: 'Approved!',
                  text: 'Story was successfully approved.',
                  timer: 1000,
                  showConfirmButton: false,
                }).then(() => {
                  this.getStory(
                    this.page,
                    this.limit,
                    this.search,
                    this.category,
                    this.sortBy,
                    this.isAdmin
                  );
                });
              } else {
                Swal.fire({
                  icon: 'success',
                  title: 'Rejected!',
                  text: 'Story was successfully rejected.',
                  timer: 1000,
                  showConfirmButton: false,
                }).then(() => {
                  this.getStory(
                    this.page,
                    this.limit,
                    this.search,
                    this.category,
                    this.sortBy,
                    this.isAdmin
                  );
                });
              }
            });
        });
    } catch (error) {
      throw error;
    }
  }

  async editorChoice(uuid: string, status: boolean): Promise<void> {
    try {
      const statusCheck = status ? false : true;
      this.nexlearningService
        .editorChoiceStory(uuid, statusCheck)
        .subscribe(() => {
          if (status) {
            Swal.fire({
              icon: 'success',
              title: 'Unselected Editor Choice!',
              text: 'Editor choice was successfully updated.',
              timer: 1000,
              showConfirmButton: false,
            }).then(() => {
              this.getStory(
                this.page,
                this.limit,
                this.search,
                this.category,
                this.sortBy,
                this.isAdmin
              );
            });
          } else {
            Swal.fire({
              icon: 'success',
              title: 'Selected Editor Choice!',
              text: 'Editor Choice was successfully updated.',
              timer: 1000,
              showConfirmButton: false,
            }).then(() => {
              this.getStory(
                this.page,
                this.limit,
                this.search,
                this.category,
                this.sortBy,
                this.isAdmin
              );
            });
          }
        });
    } catch (error) {
      throw error;
    }
  }

  async banStory(uuid: string, status: boolean): Promise<void> {
    try {
      const statusCheck = status ? false : true;
      this.nexlearningService
        .activeDeactiveStory(uuid, statusCheck)
        .subscribe(() => {
          if (status) {
            Swal.fire({
              icon: 'success',
              title: 'Permitted!',
              text: 'Story was successfully Permitted.',
              timer: 1000,
              showConfirmButton: false,
            }).then(() => {
              this.getStory(
                this.page,
                this.limit,
                this.search,
                this.category,
                this.sortBy,
                this.isAdmin
              );
            });
          } else {
            Swal.fire({
              icon: 'success',
              title: 'Banned!',
              text: 'Story was successfully banned.',
              timer: 1000,
              showConfirmButton: false,
            }).then(() => {
              this.getStory(
                this.page,
                this.limit,
                this.search,
                this.category,
                this.sortBy,
                this.isAdmin
              );
            });
          }
        });
    } catch (error) {
      throw error;
    }
  }

  async getStatistic(): Promise<void> {
    this.nexlearningService
      .getStoryStatistic('Inspirational')
      .subscribe((response) => {
        this.statistic = response.data;
      });
  }
}
