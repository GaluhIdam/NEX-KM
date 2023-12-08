import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment.prod';
import { NexLearningService } from '../../nex-learning.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  faArrowRight,
  faBookBookmark,
  faBookOpen,
  faSearch,
  faCommentDots,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import { BestPracticeDTO } from '../../dtos/best-practice.dto';
import { Subscription, debounceTime, tap } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';

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
    private readonly router: Router,
    private readonly nexLearningService: NexLearningService,
    private sanitizer: DomSanitizer
  ) {
    super(BestPracticeComponent.name);
  }

  //Variable
  //-------------------------------------------------------------------------
  obs!: Subscription;
  personalName!: string;
  urlAvatar: string = environment.httpUrl + '/v1/api/file-manager/avatar/';
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
  articles: BestPracticeDTO[] = [];
  articles1: BestPracticeDTO[] = [];
  articlesRecent: BestPracticeDTO[] = [];
  categoryArticle: BestPracticeDTO[] = [];
  articleById!: BestPracticeDTO;

  load: boolean = true;

  articlesResult: BestPracticeDTO[] = [];
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
    this.getBestPractices();
    this.obs = this.mform.valueChanges
      .pipe(debounceTime(500))
      .subscribe((data) => {
        this.getBestPracticeDataX(
          data.page,
          data.limit,
          data.search,
          'trending'
        );
      });
  }
  ngOnDestroy(): void {
    this.obs.unsubscribe();
  }

  async getBestPracticeDataX(
    page: number,
    limit: number,
    search: string,
    sortBy: string
  ): Promise<void> {
    try {
      this.nexLearningService
        .getBestPractice(page, limit, search, sortBy)
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
    this.nexLearningService
      .getBestPractice(1, 1, '', 'trending')
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
          .getBestPractice(1, 4, '', 'trending')
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
              .getBestPractice(1, 5, '', 'desc')
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
  }

  //Get Category Article
  async getBestPractices(): Promise<void> {
    this.nexLearningService.getBestPractice(1, 20).subscribe((data) => {
      this.categoryArticle = data.data.result;
    });
  }

  //Decode HTML
  getSanitizedHTML(htmlString: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(htmlString);
  }
  articlePost(): void {
    this.router.navigate(['/user/nex-learning/article-post']);
  }

  showMore(): void {
    this.limit = this.limit + 10;
    this.mform.get('limit')?.setValue(this.limit);
    this.getBestPracticeDataX(
      this.mform.get('page')?.value,
      this.mform.get('limit')?.value,
      this.mform.get('search')?.value,
      'trending'
    );
  }
}
