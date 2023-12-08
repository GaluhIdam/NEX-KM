import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  faCircleChevronLeft,
  faCircleChevronRight,
  faSearch,
  faStar,
} from '@fortawesome/free-solid-svg-icons';
import { KeycloakService } from 'keycloak-angular';
import { NexLearningService } from './nex-learning.service';
import { ArticlesDTO } from './dtos/articles.dto';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { StoryDTO, WatchStoryDTO } from './dtos/story.dto';
import { PlyrComponent } from 'ngx-plyr';
import * as Plyr from 'plyr';
import { ArticleCategoryDTO } from './dtos/article-category.dto';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BestPracticeDTO } from './dtos/best-practice.dto';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import { Dropdown, Ripple, initTE } from 'tw-elements';

import { Subscription, debounceTime, map, tap } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import { LearningFuseDTO, MergeLearningDTO } from './dtos/fuse.dto';
import { FormControl, FormGroup } from '@angular/forms';
import { HomePageService } from '../home-page/homepage.service';
import { SoeService } from 'src/app/core/soe/soe.service';

@Component({
  selector: 'app-nex-learning',
  templateUrl: './nex-learning.component.html',
  styleUrls: ['./nex-learning.component.css'],
})
export class NexLearningComponent
  extends BaseController
  implements OnInit, OnDestroy
{
  constructor(
    private readonly router: Router,
    private readonly keycloakService: KeycloakService,
    private readonly nexLearningService: NexLearningService,
    private sanitizer: DomSanitizer,
    private readonly hompageService: HomePageService,
    private readonly soeService: SoeService,
    private elementRef: ElementRef
  ) {
    super(NexLearningComponent.name);
  }

  //Variable
  //------------------------------------------------------------------------

  urlAvatar: string = environment.httpUrl + '/v1/api/file-manager/avatar/';
  faCircleChevronLeft = faCircleChevronLeft;
  faCircleChevronRight = faCircleChevronRight;
  personalName!: string;

  obs!: Subscription;

  faSearch = faSearch;
  faStar = faStar;
  name!: string;
  photo!: string;
  photo_default: string =
    'https://st3.depositphotos.com/1767687/16607/v/450/depositphotos_166074422-stock-illustration-default-avatar-profile-icon-grey.jpg';
  inspiStory: StoryDTO[] = [];
  retirStory: StoryDTO[] = [];
  articles: ArticlesDTO<ArticleCategoryDTO>[] = [];
  articles1: ArticlesDTO<ArticleCategoryDTO>[] = [];
  articles2: ArticlesDTO<ArticleCategoryDTO>[] = [];
  articlesRecent: BestPracticeDTO[] = [];

  load: boolean = true;

  search: string = '';
  showSearch: boolean = false;
  hideDropdownTimeout: any;

  trendingSearch: LearningFuseDTO[] = [];
  suggestionSearch: LearningFuseDTO[] = [];
  searchByInterest: MergeLearningDTO[] = [];

  //Carousel Option
  customOptionsOne: OwlOptions = {
    margin: 10,
    stagePadding: 0,
    autoplay: true,
    autoplayTimeout: 2000,
    autoplayHoverPause: false,
    merge: true,
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: true,
    center: false,
    navSpeed: 600,
    navText: ['&#8249;', '&#8250;'],
    responsive: {
      0: {
        items: 1,
      },
      400: {
        items: 1,
      },
      720: {
        items: 4,
      },
      1000: {
        items: 4,
      },
    },
    nav: false,
  };

  resultBySearch: MergeLearningDTO[] = [];
  page: number = 1;
  limit: number = 10;
  totalData: number = 0;
  pageData: Array<number> = [];
  timeTaken: number = 0;

  mform: FormGroup = new FormGroup({
    search: new FormControl(this.search),
    page: new FormControl(this.page),
    limit: new FormControl(this.limit),
  });

  //Function Method
  //-------------------------------------------------------------------------

  ngOnInit(): void {
    initTE({ Dropdown, Ripple });
    this.showTrendingSearchData();
    this.getUserDataByPersonalNumber(
      Number(this.keycloakService.getUsername())
    );
    this.getStoryInspirational(1, 10, '', 'Inspirational', 'trending');
    this.getStoryRetirement(1, 10, '', 'Retirement', 'trending');
    this.getArticle();
    this.getBestPractices();
    this.checkphoto(this.keycloakService.getUsername());
    this.photo =
      'https://talentlead.gmf-aeroasia.co.id/images/avatar/' +
      this.keycloakService.getUsername() +
      '.jpg';
    this.obs = this.mform.valueChanges
      .pipe(debounceTime(500))
      .subscribe((data) => {
        this.suggestionSearch = [];
        this.showSuggestionSearchData(data.search);
        if (this.showSearch === false) {
          this.searchByInterest = [];
        }
        if (this.showSearch === true) {
          this.showResultBasedInterest();
        }
      });
  }

  ngOnDestroy(): void {
    this.obs.unsubscribe();
  }

  showAllArticle(): void {
    this.router.navigate(['user/nex-learning/show-all-article']);
  }

  inspirationalStory(): void {
    this.router.navigate(['user/nex-learning/inspirational-story']);
  }

  retirementStory(): void {
    this.router.navigate(['user/nex-learning/retirement-story']);
  }

  bestPractice(): void {
    this.router.navigate(['user/nex-learning/best-practice']);
  }

  //Decode HTML
  getSanitizedHTML(htmlString: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(htmlString);
  }

  //Get Personal Info from SOE
  async getUserDataByPersonalNumber(personalNumber: number): Promise<void> {
    try {
      this.nexLearningService.getUser(personalNumber).subscribe((data) => {
        this.personalName = this.transform(data.personalName);
      });
    } catch (error) {
      throw error;
    }
  }

  //Get Article
  async getArticle(): Promise<void> {
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
          .getArticleData(2, 1, '', 'trending')
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
              .getArticleData(3, 1, '', 'trending')
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
                this.articles2 = data.data.result;
                this.load = false;
              });
          });
      });
  }

  //Get Story Inspirational
  async getStoryInspirational(
    page: number,
    limit: number,
    search: string,
    category: string,
    sortBy: string
  ): Promise<void> {
    this.nexLearningService
      .getStory(page, limit, search, category, sortBy)
      .pipe(
        tap((response) => {
          if (response.data.result) {
            response.data.result.forEach((image) => {
              image.path =
                environment.httpUrl +
                '/v1/api/file-manager/get-imagepdf/' +
                image.path;
              image.cover =
                environment.httpUrl +
                '/v1/api/file-manager/get-imagepdf/' +
                image.cover;
            });
          }
        })
      )
      .subscribe((data) => {
        this.inspiStory = data.data.result;
      });
  }

  //Get Story Retirement
  async getStoryRetirement(
    page: number,
    limit: number,
    search: string,
    category: string,
    sortBy: string
  ): Promise<void> {
    this.nexLearningService
      .getStory(page, limit, search, category, sortBy)
      .pipe(
        tap((response) => {
          if (response.data.result) {
            response.data.result.forEach((image) => {
              image.path =
                environment.httpUrl +
                '/v1/api/file-manager/get-imagepdf/' +
                image.path;
              image.cover =
                environment.httpUrl +
                '/v1/api/file-manager/get-imagepdf/' +
                image.cover;
            });
          }
        })
      )
      .subscribe((data) => {
        this.retirStory = data.data.result;
      });
  }

  //Get Category Article
  async getBestPractices(): Promise<void> {
    this.nexLearningService
      .getBestPractice(1, 5, '', 'trending')
      .pipe(
        tap((data) => {
          if (data.data.result) {
            data.data.result.forEach((dtx) => {
              dtx.path =
                environment.httpUrl +
                '/v1/api/file-manager/get-imagepdf/' +
                dtx.path;
            });
          }
        })
      )
      .subscribe((data) => {
        this.articlesRecent = data.data.result;
      });
  }

  transform(value: string): string {
    const words = value.toLowerCase().split(' ');
    for (let i = 0; i < words.length; i++) {
      words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
    }
    return words.join(' ');
  }

  //Check Photo
  private async checkphoto(personal_number: string): Promise<void> {
    const imageUrl = `https://talentlead.gmf-aeroasia.co.id/images/avatar/${personal_number}.jpg`;

    const img = new Image();
    img.onload = () => {
      this.photo = imageUrl;
    };
    img.onerror = () => {
      const defaultImageUrl =
        'https://st3.depositphotos.com/1767687/16607/v/450/depositphotos_166074422-stock-illustration-default-avatar-profile-icon-grey.jpg';
      this.photo = defaultImageUrl;
    };
    img.src = imageUrl;
  }

  viewArticle(uuid: string): void {
    this.router.navigate([`/user/nex-learning/article/${uuid}`]);
  }

  //Media Player
  @ViewChild(PlyrComponent, { static: true })
  plyr!: PlyrComponent;

  player!: Plyr;

  played(event: Plyr.PlyrEvent, uuid: string, storyId: number) {
    this.addView(uuid, this.keycloakService.getUsername(), storyId);
  }

  play(): void {
    this.player.play();
  }

  pause(): void {
    this.player.pause();
  }

  stop(): void {
    this.player.stop();
  }

  //Add View
  async addView(
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

  // Show trending search
  async showTrendingSearchData(): Promise<void> {
    try {
      this.nexLearningService
        .showTrending()
        .subscribe((response) => (this.trendingSearch = response));
    } catch (error) {
      throw error;
    }
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

  onInputFocus() {
    this.showSearch = true;
    clearTimeout(this.hideDropdownTimeout);
  }

  onInputBlur() {
    this.hideDropdownTimeout = setTimeout(() => {
      this.showSearch = false;
    }, 250);
  }

  // Show content by interest user in search engine
  async showResultBasedInterest(): Promise<void> {
    try {
      this.hompageService
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

  async showResultBySearchEngine(
    search: string,
    page: number,
    limit: number
  ): Promise<void> {
    try {
      const startTime = performance.now();
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

  showMore(): void {
    this.page = this.page++;
    this.limit = this.limit;
    this.mform.get('limit')?.setValue(this.limit);
    this.mform.get('page')?.setValue(this.page);
    this.showResultBySearchEngine(
      this.mform.get('search')?.value,
      this.mform.get('page')?.value,
      this.limit
    );
  }

  trendingClick(search: string): void {
    this.mform.get('search')?.setValue(search);
    this.showResultBySearchEngine(
      this.mform.get('search')?.value,
      this.mform.get('page')?.value,
      this.limit
    );
  }
}
