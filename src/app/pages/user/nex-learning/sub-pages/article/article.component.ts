import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NexLearningService } from '../../nex-learning.service';
import {
  faArrowRight,
  faBookBookmark,
  faBookOpen,
  faSearch,
  faCommentDots,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { ArticlesDTO } from '../../dtos/articles.dto';
import { ArticleCategoryDTO } from '../../dtos/article-category.dto';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subscription, debounceTime, tap } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';

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
    private readonly router: Router,
    private readonly nexLearningService: NexLearningService,
    private sanitizer: DomSanitizer
  ) {
    super(ArticleComponent.name);
  }

  //Variable
  //-------------------------------------------------------------------------
  obs!: Subscription;
  personalName!: string;
  imageUrl = environment.httpUrl + '/v1/api/file-manager/get-imagepdf/';
  faSearch = faSearch;
  faArrowRight = faArrowRight;
  faBookBookmark = faBookBookmark;
  faBookOpen = faBookOpen;
  faChevronRight = faChevronRight;
  faComment = faCommentDots;
  name!: string;
  photo!: string;
  photo_default: string =
    'https://st3.depositphotos.com/1767687/16607/v/450/depositphotos_166074422-stock-illustration-default-avatar-profile-icon-grey.jpg';
  articles: ArticlesDTO<ArticleCategoryDTO>[] = [];
  articles1: ArticlesDTO<ArticleCategoryDTO>[] = [];
  articlesRecent: ArticlesDTO<ArticleCategoryDTO>[] = [];
  categoryArticle: ArticleCategoryDTO[] = [];
  articleById!: ArticlesDTO<ArticleCategoryDTO>;

  load: boolean = true;

  articlesResult: ArticlesDTO<ArticleCategoryDTO>[] = [];
  page: number = 1;
  limit: number = 10;
  totalData: number = 0;
  pageData: Array<number> = [];
  timeTaken: number = 0;
  search: string = '';

  mform: FormGroup = new FormGroup({
    search: new FormControl(this.search),
    page: new FormControl(this.page),
    limit: new FormControl(this.limit),
  });

  ngOnInit(): void {
    this.getArticle();
    this.getArticleCategory();
    this.obs = this.mform.valueChanges
      .pipe(debounceTime(500))
      .subscribe((data) => {
        this.articlesResult = [];
        this.getArticleDataX(data.page, data.limit, data.search, 'trending');
      });
  }
  ngOnDestroy(): void {
    this.obs.unsubscribe();
  }

  async getArticleDataX(
    page: number,
    limit: number,
    search: string,
    sortBy: string
  ): Promise<void> {
    try {
      this.nexLearningService
        .getArticleData(page, limit, search, sortBy)
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
        .subscribe((response) => {
          this.articlesResult = response.data.result;
          this.totalData = response.data.total;
        });
    } catch (error) {
      throw error;
    }
  }

  //Get Article
  async getArticle(): Promise<void> {
    try {
      this.nexLearningService
        .getArticleData(1, 1, '', 'trending')
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
        .subscribe(async (data) => {
          this.articles = data.data.result;
          this.nexLearningService
            .getArticleData(1, 4, '', 'trending')
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
            .subscribe(async (data) => {
              this.articles1 = data.data.result;
              this.nexLearningService
                .getArticleData(1, 5, '', 'desc')
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
                .subscribe(async (data) => {
                  this.articlesRecent = data.data.result;
                  this.load = false;
                });
            });
        });
    } catch (error) {
      throw error;
    }
  }

  //Get Category Article
  async getArticleCategory(): Promise<void> {
    try {
      this.nexLearningService
        .getCategoryArticle(1, 20, '', 'true')
        .subscribe((data) => {
          this.categoryArticle = data.data.result;
        });
    } catch (error) {
      throw error;
    }
  }

  //Decode HTML
  getSanitizedHTML(htmlString: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(htmlString);
  }
  articlePost(): void {
    this.router.navigate(['/user/nex-learning/article-post']);
  }

  directWithCategory(id: number): void {
    this.router.navigate(['/user/nex-learning/article-category', id]);
  }

  showMore(): void {
    this.limit = this.limit + 10;
    this.mform.get('limit')?.setValue(this.limit);
    this.getArticleDataX(
      this.mform.get('page')?.value,
      this.mform.get('limit')?.value,
      this.mform.get('search')?.value,
      'trending'
    );
  }
}
