import {
  BestPracticePublishDTO,
  BestPracticeStatusDTO,
} from './../../../../user/nex-learning/dtos/best-practice.dto';
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
  faL,
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
import { BestPracticeDTO } from 'src/app/pages/user/nex-learning/dtos/best-practice.dto';
import { StatisticArticleDTO } from 'src/app/pages/user/nex-learning/dtos/articles.dto';

@Component({
  selector: 'app-best-practice',
  templateUrl: './best-practice.component.html',
  styleUrls: ['./best-practice.component.css'],
})
export class BestPracticeComponent
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
    super(BestPracticeComponent.name);
    this.initTitle();
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

  title: any;

  page: number = 1;
  limit: number = 10;
  search: string = '';
  sortBy: string = 'trending';
  totalData: number = 0;
  pageData: Array<number> = [];
  descStatus: string | null = null;

  bestPracticeData!: Array<BestPracticeDTO>;

  statistic: StatisticArticleDTO = {
    allTime: 0,
    thisMonth: 0,
    published: 0,
    needApproval: 0,
    percent: 0,
  };

  mform: FormGroup = new FormGroup({
    search: new FormControl(''),
    page: new FormControl(this.page),
    limit: new FormControl(this.limit),
  });

  ngOnDestroy(): void {}

  ngOnInit(): void {
    this.getStatistic();
    this.getDataBestPractice(this.page, this.limit, this.search, this.sortBy);
    this.obs = this.mform.valueChanges
      .pipe(debounceTime(500))
      .subscribe((data) => {
        if (data.page < 1) {
          data.page < 1 ? this.mform.get('page')?.setValue(1) : data.page;
        } else {
          this.getDataBestPractice(data.page, data.limit, data.search);
        }
      });
  }

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

  //Get Best Practice
  async getDataBestPractice(
    page: number,
    limit: number,
    search?: string,
    sortBy?: string
  ): Promise<void> {
    try {
      this.nexlearningService
        .getBestPractice(page, limit, search, sortBy)
        .subscribe((response) => {
          this.bestPracticeData = response.data.result;
          this.totalData = response.data.total;
          this.paginate(this.totalData, this.limit, this.pageData);
        });
    } catch (error) {
      throw error;
    }
  }

  //Approve or Reject Best Practice
  async approveReject(uuid: string, status: boolean): Promise<void> {
    try {
      this.nexlearningService
        .getUser(this.keycloackService.getUsername())
        .subscribe((data) => {
          const dto: BestPracticeStatusDTO = {
            approvalStatus: status,
            approvalDesc: this.descStatus,
            approvalBy: data.personalName,
          };
          this.nexlearningService
            .approveRejectBestPractice(uuid, dto)
            .subscribe(() => {
              this.descStatus = null;
              if (status) {
                Swal.fire({
                  icon: 'success',
                  title: 'Approved!',
                  text: 'Best Practice was successfully approved.',
                  timer: 1000,
                  showConfirmButton: false,
                }).then(() => {
                  this.getDataBestPractice(
                    this.page,
                    this.limit,
                    this.search,
                    this.sortBy
                  );
                });
              } else {
                Swal.fire({
                  icon: 'success',
                  title: 'Rejected!',
                  text: 'Best Practice was successfully rejected.',
                  timer: 1000,
                  showConfirmButton: false,
                }).then(() => {
                  this.getDataBestPractice(
                    this.page,
                    this.limit,
                    this.search,
                    this.sortBy
                  );
                });
              }
            });
        });
    } catch (error) {
      throw error;
    }
  }

  //Editor Choice Best Practice
  async editorChoice(uuid: string, status: boolean): Promise<void> {
    try {
      const statusCheck = status ? false : true;
      this.nexlearningService
        .editorChoiceBestPractice(uuid, statusCheck)
        .subscribe(() => {
          if (status) {
            Swal.fire({
              icon: 'success',
              title: 'Unselected Editor Choice!',
              text: 'Editor choice was successfully updated.',
              timer: 1000,
              showConfirmButton: false,
            }).then(() => {
              this.getDataBestPractice(
                this.page,
                this.limit,
                this.search,
                this.sortBy
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
              this.getDataBestPractice(
                this.page,
                this.limit,
                this.search,
                this.sortBy
              );
            });
          }
        });
    } catch (error) {
      throw error;
    }
  }

  //Ban Best Practice
  async banBestPractice(uuid: string, status: boolean): Promise<void> {
    try {
      const statusCheck = status ? false : true;
      this.nexlearningService
        .activeDeactiveBestPractice(uuid, statusCheck)
        .subscribe(() => {
          if (status) {
            Swal.fire({
              icon: 'success',
              title: 'Permitted!',
              text: 'Story was successfully Permitted.',
              timer: 1000,
              showConfirmButton: false,
            }).then(() => {
              this.getDataBestPractice(
                this.page,
                this.limit,
                this.search,
                this.sortBy
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
              this.getDataBestPractice(
                this.page,
                this.limit,
                this.search,
                this.sortBy
              );
            });
          }
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

  async getStatistic(): Promise<void> {
    this.nexlearningService.getBestPracticeStatistic().subscribe((response) => {
      this.statistic = response.data;
    });
  }
}
