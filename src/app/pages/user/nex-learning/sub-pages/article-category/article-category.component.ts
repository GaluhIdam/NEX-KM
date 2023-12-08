import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NexLearningService } from '../../nex-learning.service';
import {
  faArrowRight,
  faBookBookmark,
  faBookOpen,
  faImage,
  faSearch,
  faStar,
  faBars,
  faCircleExclamation,
  faCircleChevronLeft,
  faCircleChevronRight,
  faChevronRight,
  faComment
} from '@fortawesome/free-solid-svg-icons';
import { ArticlesDTO } from '../../dtos/articles.dto';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import { Subscription, debounceTime, tap } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { ArticleCategoryDTO } from '../../dtos/article-category.dto';
import { Select, initTE } from 'tw-elements';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-article-category',
  templateUrl: './article-category.component.html',
  styleUrls: ['./article-category.component.css'],
})
export class ArticleCategoryComponent
  extends BaseController
  implements OnInit, OnDestroy
{
  constructor(
    private readonly router: Router,
    private readonly activeRoute: ActivatedRoute,
    private readonly nexLearningService: NexLearningService
  ) {
    super(ArticleCategoryComponent.name);
  }

  //Variable
  //-------------------------------------------------------------------------
  faArrowRight = faArrowRight;
  faBookOpen = faBookOpen;
  faImage = faImage;
  faSearch = faSearch;
  faBookBookmark = faBookBookmark;
  faCircleExclamation = faCircleExclamation;
  faCircleChevronLeft = faCircleChevronLeft;
  faCircleChevronRight = faCircleChevronRight;
  faStar = faStar;
  faBars = faBars;
  faComment = faComment;
  faChevronRight = faChevronRight;

  load: boolean = true;
  obs!: Subscription;
  selectedCities: any;
  totalData: number = 0;
  pageData: Array<number> = [];
  page: number = 1;
  limit: number = 10;
  search: string = '';
  sortBy: string = 'trending';
  category!: string;
  categoryId!: number;
  articles: ArticlesDTO<ArticleCategoryDTO>[] = [];

  categoryArticle: ArticleCategoryDTO[] = [];
  selectedItems: ArticleCategoryDTO[] = [];
  categorySelected: any;

  mform: FormGroup = new FormGroup({
    search: new FormControl(),
    sortBy: new FormControl(this.sortBy),
    category: new FormControl(),
    page: new FormControl(this.page),
    limit: new FormControl(this.limit),
  });

  ngOnInit(): void {
    initTE({ Select });
    this.getArticleCategory();
    this.activeRoute.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.getArticle(
          this.page,
          this.limit,
          this.search,
          this.sortBy,
          Number(id)
        );
      } else {
        this.getArticle(this.page, this.limit, this.search, this.sortBy);
      }
    });
    this.obs = this.mform.valueChanges
      .pipe(debounceTime(500))
      .subscribe((data) => {
        if (data.page < 1) {
          data.page < 1 ? this.mform.get('page')?.setValue(1) : data.page;
        } else {
          this.getArticle(
            data.page,
            data.limit,
            data.search == null ? '' : data.search,
            data.sortBy,
            data.category
          );
        }
      });
  }
  ngOnDestroy(): void {
    this.obs.unsubscribe();
  }

  //Get Article
  async getArticle(
    page: number,
    limit: number,
    search: string,
    sortBy: string,
    categoryOps?: number
  ): Promise<void> {
    try {
      this.nexLearningService
        .getCategoryArticle(this.page, this.limit, '', 'true')
        .subscribe((data) => {
          if (data.data.result) {
            if (!categoryOps) {
              this.category = data.data.result[0].title;
              this.categoryId = data.data.result[0].id;
              this.mform.get('category')?.setValue(this.categoryId);
            }
            this.nexLearningService
              .getArticleDataCategory(
                page,
                limit,
                search,
                sortBy,
                categoryOps == null ? data.data.result[0].id : categoryOps
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
              .subscribe((dtx) => {
                data.data.result.forEach((dtz) => {
                  if (dtz.id == categoryOps) {
                    this.category = dtz.title;
                    this.categoryId = dtz.id;
                  }
                });
                this.articles = dtx.data.result;
                this.totalData = dtx.data.total;
                this.paginate(
                  this.totalData,
                  this.mform.get('limit')?.value,
                  this.pageData
                );
                this.load = false;
              });
          }
        });
    } catch (error) {
      throw error;
    }
  }

  //Get Category Article
  async getArticleCategory(): Promise<void> {
    this.nexLearningService
      .getCategoryArticle(this.page, this.limit, '', 'true')
      .subscribe((data) => {
        this.categoryArticle = data.data.result;
      });
  }

  viewArticle(uuid: string): void {
    this.router.navigate(['/user/nex-learning/article/' + uuid]);
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
}
