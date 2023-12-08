import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  faSearch,
  faMessage,
  faShareNodes,
  faTag,
  faBookOpen,
  faChevronRight,
  faChevronDown,
  faChevronUp,
} from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { ForumCommentDTO } from 'src/app/core/dtos/nex-talk/forum-comment.dto';
import { ForumDTO } from 'src/app/core/dtos/nex-talk/forum.dto';
import { TalkCategoryDTO } from 'src/app/core/dtos/nex-talk/talk-category.dto';
import { PaginatorRequest } from 'src/app/core/requests/paginator.request';
import { ParamsRequest } from 'src/app/core/requests/params.request';
import { LocalService } from 'src/app/core/services/local/local.service';
import { ForumDataService } from 'src/app/core/services/nex-talk/forum-data.service';
import { TalkCategoryDataService } from 'src/app/core/services/nex-talk/talk-category.service';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import {
  UserListDTO,
  defaultUserListDTO,
} from '../../../home-page/dtos/user-list.dto';
import { HomePageService } from '../../../home-page/homepage.service';
import { ForumVoteDataService } from 'src/app/core/services/nex-talk/forum-vote-data.service';
import { KeycloakService } from 'keycloak-angular';
import { ForumVoteDTO } from 'src/app/core/dtos/nex-talk/forum-vote.dto';

@Component({
  selector: 'app-forum-page',
  templateUrl: './forum-page.component.html',
  styleUrls: ['./forum-page.component.css'],
})
export class ForumPageComponent implements OnInit, OnDestroy {
  faSearch = faSearch;
  faMessage = faMessage;
  faShareNodes = faShareNodes;
  faTag = faTag;
  faBookOpen = faBookOpen;
  faChevronRight = faChevronRight;
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;

  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  //#region ------------- Talk Categories -------------
  talkCategoryData: TalkCategoryDTO[];
  isCategoryLoading: boolean;
  selectedTalkCategory: TalkCategoryDTO | undefined;
  //#endregion ---------- Talk Catogories -------------

  //#region ------------ Forums -----------------------
  forumData: ForumDTO[];
  forumUploaders: UserListDTO[];
  photoForumUploaders: string[];
  isForumLoading: boolean;
  isForumVoteLoading: boolean[];
  // Parse the description HTML string
  parsedForumDescriptions: string[];
  isShowMoreButtonClicked: boolean[];
  //#endregion --------- Forums -----------------------

  paginator?: PaginatorRequest;
  dataRequest?: ParamsRequest;

  pages: number[];
  sortBy: string;

  //default params
  searchValue: String;

  //current user
  personalNumber: string;

  constructor(
    private readonly router: Router,
    private readonly localService: LocalService,
    private readonly talkCategoryDataService: TalkCategoryDataService,
    private readonly forumDataService: ForumDataService,
    private readonly forumVoteDataService: ForumVoteDataService,
    private readonly toastr: ToastrService,
    private readonly homePageService: HomePageService,
    private readonly keycloakService: KeycloakService
  ) {
    this.talkCategoryData = [];
    this.isCategoryLoading = false;
    this.forumData = [];
    this.forumUploaders = [];
    this.photoForumUploaders = [];
    this.parsedForumDescriptions = [];
    this.isForumLoading = false;
    this.pages = [];
    this.sortBy = 'desc';
    this.searchValue = '';
    this.isForumVoteLoading = [];
    this.isShowMoreButtonClicked = [];
    this.personalNumber = '';
  }

  ngOnInit(): void {
    this.initializeUserOptions();
    this.initPaginator();
    this.initParams();
    this.initTalkCategoryData();
  }

  ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.unsubscribe();
  }

  //GET Personal Number from Keycloak
  private initializeUserOptions(): void {
    this.personalNumber = this.keycloakService.getUsername();
  }

  forumComment(uuid: string): void {
    this.router.navigate(['/user/nex-talks/forum/comments/' + uuid]);
  }

  initTalkCategoryData(): void {
    this.isCategoryLoading = true;
    let params: string = `page=${1}&limit=${1000}&status=${true}`;
    this.talkCategoryDataService
      .getTalkCategoryData(params)
      .pipe(takeUntil(this._onDestroy$))
      .subscribe((response) => {
        this.talkCategoryData = response.data.data;
        this.isCategoryLoading = false;
        if (this.selectedTalkCategory === undefined) {
          if (this.talkCategoryData.length > 0) {
            this.localService.saveData(
              'forum_categories',
              JSON.stringify(this.talkCategoryData)
            );
            const selectedCategory = this.localService.getData(
              'selected_forum_category'
            );

            if (selectedCategory !== null) {
              this.selectedTalkCategory = JSON.parse(selectedCategory);
            } else {
              this.selectedTalkCategory = this.talkCategoryData[0];
              this.localService.saveData(
                'selected_forum_category',
                JSON.stringify(this.selectedTalkCategory)
              );
            }
            this.initForumData(this.selectedTalkCategory?.id, true);
          }
        }
      });
  }

  initForumData(talkCategoryId: number | undefined, refresh?: boolean): void {
    if (refresh) {
      this.isForumLoading = true;
    }
    let params: string = `page=${this.dataRequest?.page ?? 1}&limit=${
      this.dataRequest?.limit
    }&status=true&approval_status=Approved`;

    if (talkCategoryId) {
      params += `&id_forum_category=${talkCategoryId}`;
    }

    if (this.searchValue) {
      params += `&search=${this.searchValue}`;
    }

    if (this.sortBy) {
      params += `&order_by=${this.sortBy}`;
    }

    this.forumDataService
      .getForumData(params)
      .pipe(
        tap((response) => {
          this.forumUploaders = new Array(response.data.data.length).fill(
            defaultUserListDTO
          );
          this.parsedForumDescriptions = new Array(response.data.data.length);
          this.isForumVoteLoading = new Array(response.data.data.length).fill(
            false
          );
          this.isShowMoreButtonClicked = new Array(
            response.data.data.length
          ).fill(false);
          response.data.data.map((dt, index) => {
            this.getUserData(dt.personalNumber, index);
            if (dt.path !== '-') {
              dt.path =
                environment.httpUrl +
                '/v1/api/file-manager/get-imagepdf/' +
                dt.path;
            }
            this.parsedForumDescriptions[index] = this.parseHTML(
              dt.description
            );
          });
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe((response) => {
        this.forumData = response.data.data;
        if (refresh) {
          this.isForumLoading = false;
        }
        if (this.paginator) {
          this.paginator.totalData = response.data.totalItems;
          this.paginator.totalPage = response.data.totalPages;
          this.pages = new Array(this.paginator.totalPage);
        }
      });
  }

  initPaginator(): void {
    this.paginator = {
      pageOption: [10, 20, 50, 100],
      pageNumber: 1,
      pageSize: 10,
      totalData: 0,
      totalPage: 0,
    };
  }

  initParams(): void {
    if (this.paginator) {
      this.dataRequest = {
        limit: this.paginator.pageSize,
        page: this.paginator.pageNumber,
        offset: (this.paginator.pageNumber - 1) * this.paginator.pageSize,
      };
    }
  }

  changePageNumber(isNextPage: boolean): void {
    if (this.paginator) {
      if (isNextPage) {
        if (this.paginator) {
        }
        this.paginator.pageNumber++;
      } else {
        this.paginator.pageNumber--;
      }
    }

    this.rePaginate();
  }

  goToPageNumberByPageSelect(event: number): void {
    if (this.paginator) {
      this.paginator.pageNumber = Number(event);
      this.rePaginate();
    }
  }

  goToPageNumberByPageClick(event: any): void {
    if (this.paginator) {
      this.paginator.pageNumber = Number(event);
      this.rePaginate();
    }
  }

  searchByField(event: any): void {
    this.searchValue = event.target.value;
    this.rePaginate();
  }

  changePageSize(): void {
    if (this.paginator) {
      this.paginator.pageNumber = 1;
      this.rePaginate();
    }
  }

  onChangeTalkCategory(talkCategory: TalkCategoryDTO): void {
    this.selectedTalkCategory = talkCategory;
    this.localService.saveData(
      'selected_forum_category',
      JSON.stringify(this.selectedTalkCategory)
    );
    this.rePaginate(true);
  }

  rePaginate(refresh?: boolean): void {
    if (this.paginator) {
      if (refresh) {
        this.paginator.pageNumber = 1;
        this.paginator.pageSize = 10;
      }

      if (this.dataRequest) {
        this.dataRequest.limit = this.paginator.pageSize;
        this.dataRequest.page = this.paginator.pageNumber;
        this.dataRequest.offset =
          (this.paginator.pageNumber - 1) * this.paginator.pageSize;
      }

      this.initForumData(this.selectedTalkCategory?.id, true);
    }
  }

  onChangeOrderForum(order: string): void {
    if (order === 'Recent') {
      this.sortBy = 'desc';
    } else {
      this.sortBy = 'forumComment';
    }
    this.rePaginate();
  }

  onChangeForumVote(
    index: number,
    forumId: number,
    personalNumber: string,
    isUpvote: boolean
  ): void {
    if (personalNumber === this.forumData[index].personalNumber) {
      this.toastr.info('You cannot vote for your own forum', 'Info');
    } else {
      this.isForumVoteLoading[index] = true;

      const request = {
        forumId: forumId,
        personalNumber: personalNumber,
        isUpvote: isUpvote,
      };

      this.forumVoteDataService
        .updateForumVote(request)
        .pipe(takeUntil(this._onDestroy$))
        .subscribe(
          (response) => {
            this.toastr.success('Successfully gave a vote', 'Success');
            this.isForumVoteLoading[index] = false;
            this.initForumData(this.selectedTalkCategory?.id);
          },
          (error) => {
            this.toastr.error(error.error.message, 'Failed');
            this.isForumVoteLoading[index] = false;
          }
        );
    }
  }

  calculateTimeDifference(createdAt: string): string {
    const createdAtDate = new Date(createdAt);
    const currentDate = new Date();
    const timeDifference = currentDate.getTime() - createdAtDate.getTime();

    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days >= 1) {
      return `${days}d ago`;
    } else if (hours >= 1) {
      return `${hours}hr ago`;
    } else if (minutes >= 1) {
      return `${minutes}min ago`;
    } else {
      return `${seconds}sec ago`;
    }
  }

  convertViewsFormat(viewCount: number): string {
    if (viewCount >= 1000000) {
      const formattedViews = (viewCount / 1000000).toFixed(1);
      return formattedViews + 'M';
    } else {
      return viewCount.toString();
    }
  }

  filteredForumComments(comment: ForumCommentDTO[]): number {
    return comment.filter((comment) => comment.parentId === null).length;
  }

  parseHTML(htmlString: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    return doc.body.innerHTML;
  }

  onClickedShowMoreButton(forumIndex: number) {
    this.isShowMoreButtonClicked[forumIndex] =
      !this.isShowMoreButtonClicked[forumIndex];
  }

  onGotoUserPage(personalNumber: string): void {
    this.router.navigate([`/user/home-page/view-user/${personalNumber}`]);
  }

  //Get User Data
  private getUserData(personal_number: string, index: number): void {
    this.homePageService
      .getUserListByPersonalNumber(personal_number)
      .pipe(
        tap((response) => {
          response.data.userPhoto =
            environment.httpUrl +
            '/v1/api/file-manager/get-imagepdf/' +
            response.data.userPhoto;
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe((response) => {
        this.forumUploaders[index] = response.data;
      });
  }

  calculateForumVote(forumVote: ForumVoteDTO[]): number {
    let upVote = 0;
    let downVote = 0;
    forumVote.forEach((vote) => {
      if (vote.isUpvote) {
        upVote += 1;
      } else {
        downVote += 1;
      }
    });

    if (upVote === downVote) {
      return upVote;
    } else {
      return upVote - downVote;
    }
  }

  convertedForumCountValue(value: number): number {
    return Math.abs(value);
  }
}
