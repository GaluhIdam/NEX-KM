import { Component, OnDestroy, OnInit } from '@angular/core';
import { BaseController } from 'src/app/core/BaseController/base-controller';
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
  faCircleXmark,
  faCaretUp,
  faCaretDown,
} from '@fortawesome/free-solid-svg-icons';
import { NexLearningService } from 'src/app/pages/user/nex-learning/nex-learning.service';
import {
  ArticleStatusDTO,
  ArticlesDTO,
  StatisticArticleDTO,
} from 'src/app/pages/user/nex-learning/dtos/articles.dto';
import { ArticleCategoryDTO } from 'src/app/pages/user/nex-learning/dtos/article-category.dto';
import Swal from 'sweetalert2';
import { KeycloakService } from 'keycloak-angular';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription, debounceTime, filter } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { Input, Select, Modal, Ripple, initTE } from 'tw-elements';
import { FormControl, FormGroup } from '@angular/forms';
import { SocketService } from 'src/app/core/utility/socket-io-services/socket.io.service';
import { HomePageService } from 'src/app/pages/user/home-page/homepage.service';
import { NotificationRequestDTO } from 'src/app/pages/user/home-page/dtos/notification.dto';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css'],
})
export class ArticleComponent
  extends BaseController
  implements OnInit, OnDestroy
{
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private readonly nexlearningService: NexLearningService,
    private readonly keycloackService: KeycloakService,
    private readonly webSocket: SocketService,
    private readonly homepageService: HomePageService
  ) {
    super(ArticleComponent.name);
    this.getChild(activatedRoute);
    this.initTitle();
  }
  title: any;
  //Font Awasome
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
  faCircleXmark = faCircleXmark;
  faCaretUp = faCaretUp;
  faCaretDown = faCaretDown;

  //Article Data Set Up
  page: number = 1;
  limit: number = 10;
  search: string = '';
  sortBy: string = 'trending';

  totalData: number = 0;
  pageData: Array<number> = [];
  isAdmin: string = 'true';
  statistic: StatisticArticleDTO = {
    allTime: 0,
    thisMonth: 0,
    published: 0,
    needApproval: 0,
    percent: 0,
  };

  obs!: Subscription;
  mform: FormGroup = new FormGroup({
    search: new FormControl(''),
    category: new FormControl(),
    page: new FormControl(this.page),
    limit: new FormControl(this.limit),
    sortBy: new FormControl(this.sortBy),
  });

  //category
  categoryArticle: ArticleCategoryDTO[] = [];
  articleCategoryId!: number;

  articleList: Array<ArticlesDTO<ArticleCategoryDTO>> = [];
  descStatus: string | null = null;

  ngOnInit(): void {
    initTE({ Input, Select, Modal, Ripple });
    this.getCategoryArticle();
    this.getArticleList(
      this.page,
      this.limit,
      this.search,
      this.sortBy,
      this.articleCategoryId,
      this.isAdmin
    );
    this.getStatistic();
    this.obs = this.mform.valueChanges
      .pipe(debounceTime(500))
      .subscribe((data) => {
        if (data.page < 1) {
          data.page < 1 ? this.mform.get('page')?.setValue(1) : data.page;
        } else {
          this.getArticleList(
            data.page,
            data.limit,
            data.search,
            data.sortBy,
            data.category,
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

  //Get Article Category
  async getCategoryArticle(): Promise<void> {
    try {
      this.nexlearningService.getCategoryArticle().subscribe((data) => {
        const dataTemp: ArticleCategoryDTO[] = [];
        if (data.data.result) {
          data.data.result.forEach((dto) => {
            const dtx: ArticleCategoryDTO = {
              id: dto.id,
              title: dto.title,
              status: dto.status,
              personalNumber: dto.personalNumber,
              uuid: dto.uuid,
            };
            dataTemp.unshift(dtx);
          });
          this.categoryArticle = this.categoryArticle.concat(dataTemp);
        }
      });
    } catch (error) {
      throw error;
    }
  }

  //Get List Data
  async getArticleList(
    page: number,
    limit: number,
    search: string,
    sortBy: string,
    articleCategoryId: number,
    isAdmin: string
  ): Promise<void> {
    this.nexlearningService
      .getArticleDataCategory(
        page,
        limit,
        search,
        sortBy,
        articleCategoryId,
        isAdmin
      )
      .subscribe((data) => {
        this.totalData = data.data.total;
        this.articleList = data.data.result;
        this.paginate(
          this.totalData,
          this.mform.get('limit')?.value,
          this.pageData
        );
      });
  }

  //On Change Data Desc Status
  onFormData(data: any): void {
    this.descStatus = data.descStatus;
  }

  //Post Approve or Reject
  async approveReject(uuid: string, status: boolean): Promise<void> {
    this.nexlearningService
      .getUser(this.keycloackService.getUsername())
      .subscribe((data) => {
        const dto: ArticleStatusDTO = {
          status: status,
          descStatus: this.descStatus == '' ? null : this.descStatus,
          approvalBy: data.personalName,
          approvalByPersonalNumber: data.personalNumber.toString(),
        };
        console.log(dto);
        const socket: NotificationRequestDTO = {
          senderPersonalNumber: this.keycloackService.getUsername(),
          receiverPersonalNumber: '782658',
          title: 'Your status article updated',
          description: 'Your article has been updated status',
          isRead: 'false',
          contentType: 'article',
          contentUuid: 'dsds',
        };
        this.webSocket.sendSocket(socket).subscribe();
        this.homepageService.createNotification(socket).subscribe();
        this.nexlearningService
          .approvalRejectionArticle(uuid, dto)
          .subscribe(() => {
            if (status) {
              Swal.fire({
                icon: 'success',
                title: 'Approved!',
                text: 'Article was successfully approved.',
                timer: 1000,
                showConfirmButton: false,
              }).then(() => {
                this.getArticleList(
                  this.page,
                  this.limit,
                  this.search,
                  this.sortBy,
                  this.articleCategoryId,
                  this.isAdmin
                );
              });
            } else {
              Swal.fire({
                icon: 'success',
                title: 'Rejected!',
                text: 'Article was successfully rejected.',
                timer: 1000,
                showConfirmButton: false,
              }).then(() => {
                this.getArticleList(
                  this.page,
                  this.limit,
                  this.search,
                  this.sortBy,
                  this.articleCategoryId,
                  this.isAdmin
                );
              });
            }
          });
      });
  }

  async editorChoice(uuid: string, status: boolean): Promise<void> {
    this.nexlearningService
      .editorChoiceArticle(uuid, status == status ? !status : status)
      .subscribe(() => {
        if (status) {
          Swal.fire({
            icon: 'success',
            title: 'Unselected Editor Choice!',
            text: 'Editor choice was successfully updated.',
            timer: 1000,
            showConfirmButton: false,
          }).then(() => {
            this.getArticleList(
              this.page,
              this.limit,
              this.search,
              this.sortBy,
              this.articleCategoryId,
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
            this.getArticleList(
              this.page,
              this.limit,
              this.search,
              this.sortBy,
              this.articleCategoryId,
              this.isAdmin
            );
          });
        }
      });
  }

  async banArticle(uuid: string, status: boolean): Promise<void> {
    const statusCheck = status ? false : true;
    this.nexlearningService
      .activeDeadactiveArticle(uuid, statusCheck)
      .subscribe(() => {
        if (status) {
          Swal.fire({
            icon: 'success',
            title: 'Permitted!',
            text: 'Article was successfully Permitted.',
            timer: 1000,
            showConfirmButton: false,
          }).then(() => {
            this.getArticleList(
              this.page,
              this.limit,
              this.search,
              this.sortBy,
              this.articleCategoryId,
              this.isAdmin
            );
          });
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Banned!',
            text: 'Article was successfully banned.',
            timer: 1000,
            showConfirmButton: false,
          }).then(() => {
            this.getArticleList(
              this.page,
              this.limit,
              this.search,
              this.sortBy,
              this.articleCategoryId,
              this.isAdmin
            );
          });
        }
      });
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

  //Reset Filter Category
  clear(): void {
    this.mform.get('category')?.reset();
  }

  //Sort by Params
  sortByField(params: string): void {
    this.mform.get('sortBy')?.setValue(params);
  }

  async getStatistic(): Promise<void> {
    this.nexlearningService.getArticleStatistic().subscribe((response) => {
      this.statistic = response.data;
    });
  }
}
