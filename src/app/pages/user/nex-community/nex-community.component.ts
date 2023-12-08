import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import {
  faSearch,
  faChevronCircleRight,
  faChevronRight,
  faChevronCircleLeft,
  faUsers,
  faEye,
  faImage,
} from '@fortawesome/free-solid-svg-icons';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import { CommunityDTO, RecentActivityDTO } from './dto/community.dto';
import { NexCommunityService } from './nex-community.service';
import { Subscription, debounceTime, map, tap } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import { CommunityFuseDTO, MergeCommunityDTO } from './dto/fuse.dto';
import { FormControl, FormGroup } from '@angular/forms';
import { HomePageService } from '../home-page/homepage.service';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { SoeService } from 'src/app/core/soe/soe.service';

@Component({
  selector: 'app-nex-community',
  templateUrl: './nex-community.component.html',
  styleUrls: ['./nex-community.component.css'],
})
export class NexCommunityComponent
  extends BaseController
  implements OnInit, OnDestroy
{
  bg_library = '../../../../assets/image/library/bg-library.jpg';
  faSearch = faSearch;
  faChevronRight = faChevronRight;
  faChevronCircleRight = faChevronCircleRight;
  faChevronCircleLeft = faChevronCircleLeft;
  faUsers = faUsers;
  faEye = faEye;
  faImage = faImage;

  constructor(
    private readonly nexcommunityService: NexCommunityService,
    private readonly hompageService: HomePageService,
    private readonly router: Router,
    private elementRef: ElementRef,
    private readonly keycloakService: KeycloakService,
    private readonly soeService: SoeService
  ) {
    super(NexCommunityComponent.name);
  }

  isAdmin: boolean = false;

  load: boolean = true;

  communityData: CommunityDTO[] = [];

  dataActivity: Array<RecentActivityDTO> = [];

  page: number = 1;
  limit: number = 8;
  limitActivity: number = 8;
  search: string = '';
  sortBy: string = 'createdAtDESC';

  showSearch: boolean = false;
  hideDropdownTimeout: any;

  trendingSearch: CommunityFuseDTO[] = [];
  suggestionSearch: CommunityFuseDTO[] = [];
  searchByInterest: MergeCommunityDTO[] = [];

  resultBySearch: MergeCommunityDTO[] = [];
  totalData: number = 0;
  pageData: Array<number> = [];
  timeTaken: number = 0;

  mform: FormGroup = new FormGroup({
    search: new FormControl(this.search),
    page: new FormControl(this.page),
    limit: new FormControl(this.limit),
  });

  obs!: Subscription;

  ngOnInit(): void {
    this.getCommunityData(
      this.page,
      this.limit,
      this.search,
      this.sortBy,
      this.isAdmin
    );
    this.getActivityDataAll(
      this.page,
      this.limitActivity,
      this.search,
      this.sortBy
    );
    this.showTrendingSearchData();
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

  //Get Community
  async getCommunityData(
    page: number,
    limit: number,
    search: string,
    sortBy: string,
    isAdmin: boolean
  ): Promise<void> {
    try {
      this.nexcommunityService
        .getCommunity(page, limit, search, sortBy, isAdmin)
        .pipe(
          tap((data) => {
            if (data.data.result) {
              data.data.result.forEach((image) => {
                image.thumbnailPhotoPath =
                  environment.httpUrl +
                  '/v1/api/file-manager/get-imagepdf/' +
                  image.thumbnailPhotoPath;
                image.headlinedPhotoPath =
                  environment.httpUrl +
                  '/v1/api/file-manager/get-imagepdf/' +
                  image.headlinedPhotoPath;
                image.icon =
                  environment.httpUrl +
                  '/v1/api/file-manager/get-imagepdf/' +
                  image.icon;
              });
            }
          })
        )
        .subscribe((response) => {
          this.communityData = response.data.result;
          this.load = false;
        });
    } catch (error) {
      throw error;
    }
  }

  async getActivityDataAll(
    page: number,
    limit: number,
    search: string,
    sortBy: string
  ): Promise<void> {
    try {
      this.nexcommunityService
        .getActivityAll(page, limit, search, sortBy)
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
          this.dataActivity = response.data.result;
        });
    } catch (error) {
      throw error;
    }
  }

  // Show trending search
  async showTrendingSearchData(): Promise<void> {
    try {
      this.nexcommunityService
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
        this.nexcommunityService
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
    this.showResultBySearchEngine(value, this.limit);
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
          this.nexcommunityService
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
      if (category == 'community') {
        this.router.navigate(['/user/nex-community/' + uuid]);
        window.scrollTo(0, 0);
      }
    }
  }

  async showResultBySearchEngine(search: string, limit: number): Promise<void> {
    try {
      const startTime = performance.now();
      this.nexcommunityService
        .showResultSearch(search, limit)
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
    this.limit = this.limit + 10;
    this.mform.get('limit')?.setValue(this.limit);
    this.showResultBySearchEngine(this.mform.get('search')?.value, this.limit);
  }

  trendingClick(search: string): void {
    this.mform.get('search')?.setValue(search);
    this.showResultBySearchEngine(this.mform.get('search')?.value, this.limit);
  }
}
