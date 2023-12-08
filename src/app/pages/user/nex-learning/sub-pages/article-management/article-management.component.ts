import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { NexLearningService } from '../../nex-learning.service';
import {
  faArrowRight,
  faBookBookmark,
  faBookOpen,
  faImage,
  faSearch,
  faStar,
  faBars,
  faLock,
  faGripVertical,
  faClock,
  faXmarkCircle,
  faCircleCheck,
  faCircleChevronLeft,
  faCircleChevronRight,
  faChevronRight,
  faBan,
} from '@fortawesome/free-solid-svg-icons';
import { ArticlesDTO } from '../../dtos/articles.dto';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import { Subscription, debounceTime, tap } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { ArticleCategoryDTO } from '../../dtos/article-category.dto';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-article-management',
  templateUrl: './article-management.component.html',
  styleUrls: ['./article-management.component.css'],
})
export class ArticleManagementComponent
  extends BaseController
  implements OnInit, OnDestroy
{
  constructor(
    private readonly router: Router,
    private readonly keycloakService: KeycloakService,
    private readonly nexLearningService: NexLearningService
  ) {
    super(ArticleManagementComponent.name);
  }

  //Variable
  //-------------------------------------------------------------------------
  faArrowRight = faArrowRight;
  faBookOpen = faBookOpen;
  faImage = faImage;
  faSearch = faSearch;
  faBookBookmark = faBookBookmark;
  faLock = faLock;
  faGripVertical = faGripVertical;
  faStar = faStar;
  faBars = faBars;
  faClock = faClock;
  faXmarkCircle = faXmarkCircle;
  faCircleCheck = faCircleCheck;
  faCircleChevronLeft = faCircleChevronLeft;
  faCircleChevronRight = faCircleChevronRight;
  faBan = faBan;
  faChevronRight = faChevronRight;

  load: boolean = true;
  obs!: Subscription;

  totalData: number = 0;
  pageData: Array<number> = [];
  page: number = 1;
  limit: number = 10;
  search: string = '';
  sortBy: string = 'trending';
  articles: ArticlesDTO<ArticleCategoryDTO>[] = [];

  mform: FormGroup = new FormGroup({
    search: new FormControl(),
    sortBy: new FormControl('trending'),
    page: new FormControl(this.page),
    limit: new FormControl(this.limit),
  });

  ngOnInit(): void {
    this.load = true;
    this.getArticle(
      this.page,
      this.limit,
      this.keycloakService.getUsername(),
      this.search,
      this.sortBy
    );
    this.obs = this.mform.valueChanges
      .pipe(debounceTime(500))
      .subscribe((data) => {
        if (data.page < 1) {
          data.page < 1 ? this.mform.get('page')?.setValue(1) : data.page;
        } else {
          this.getArticle(
            data.page,
            data.limit,
            this.keycloakService.getUsername(),
            data.search == null ? '' : data.search,
            data.sortBy
          );
        }
      });
  }
  ngOnDestroy(): void {
    this.obs.unsubscribe();
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

  //Get Article
  async getArticle(
    page: number,
    limit: number,
    personalNumber: string,
    search: string,
    sortBy: string
  ): Promise<void> {
    this.nexLearningService
      .getArticleDataByPersonalNumber(
        page,
        limit,
        personalNumber,
        search,
        sortBy
      )
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
        })
      )
      .subscribe((data) => {
        this.articles = data.data.result;
        this.totalData = data.data.total;
        this.paginate(
          this.totalData,
          this.mform.get('limit')?.value,
          this.pageData
        );
        this.load = false;
      });
  }

  viewArticle(uuid: string): void {
    this.router.navigate(['/user/nex-learning/article/' + uuid]);
  }

  editArticle(uuid: string): void {
    this.router.navigate(['/user/nex-learning/article-edit/' + uuid]);
  }
}
