import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  faSearch,
  faMessage,
  faShareNodes,
  faTag,
  faBookOpen,
  faChevronRight,
  faChevronDown,
  faChevronUp,
  faHeart,
  faHeartBroken,
  faComment,
  faTrash,
  faExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { KeycloakService } from 'keycloak-angular';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { ForumCommentDTO } from 'src/app/core/dtos/nex-talk/forum-comment.dto';
import { ForumVoteDTO } from 'src/app/core/dtos/nex-talk/forum-vote.dto';
import { ForumDTO } from 'src/app/core/dtos/nex-talk/forum.dto';
import { TalkCategoryDTO } from 'src/app/core/dtos/nex-talk/talk-category.dto';
import { PaginatorRequest } from 'src/app/core/requests/paginator.request';
import { ParamsRequest } from 'src/app/core/requests/params.request';
import { HeaderService } from 'src/app/core/services/header/header.service';
import { LocalService } from 'src/app/core/services/local/local.service';
import { ForumCommentDataService } from 'src/app/core/services/nex-talk/forum-comment-data.service';
import { ForumDataService } from 'src/app/core/services/nex-talk/forum-data.service';
import { TalkCategoryDataService } from 'src/app/core/services/nex-talk/talk-category.service';
import { SoeDTO } from 'src/app/core/soe/soe.dto';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import Swal from 'sweetalert2';
import { ForumVoteDataService } from '../../../../../core/services/nex-talk/forum-vote-data.service';
import { HomePageService } from '../../../home-page/homepage.service';
import {
  UserListDTO,
  defaultUserListDTO,
} from '../../../home-page/dtos/user-list.dto';
import { ForumCommentLikeDataService } from 'src/app/core/services/nex-talk/forum-comment-like-data.service';
import { ForumCommentLikeDTO } from 'src/app/core/dtos/nex-talk/forum-comment-like.dto';

@Component({
  selector: 'app-forum-comments',
  templateUrl: './forum-comments.component.html',
  styleUrls: ['./forum-comments.component.css'],
})
export class ForumCommentsComponent implements OnInit, OnDestroy {
  faSearch = faSearch;
  faMessage = faMessage;
  faShareNodes = faShareNodes;
  faTag = faTag;
  faBookOpen = faBookOpen;
  faChevronRight = faChevronRight;
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  faHeart = faHeart;
  faHeartBroken = faHeartBroken;
  faComment = faComment;
  faTrash = faTrash;
  faExclmation = faExclamation;

  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  //#region ------------- Talk Categories -------------
  talkCategoryData: TalkCategoryDTO[];
  selectedTalkCategory: TalkCategoryDTO | undefined;
  //#endregion ---------- Talk Categories --------------

  //#region ------------- Forum -------------
  forumDetailData: ForumDTO | undefined;
  forumUploader: UserListDTO;

  // Parse the description HTML string
  parsedForumDescription: string;
  //#endregion ---------- Forum --------------

  //#region ------------- Comment -------------
  forumCommentData: ForumCommentDTO[];
  isCommentLoading: boolean;
  forumCommentUsers: UserListDTO[];
  forumReplayCommentUsers: UserListDTO[][];
  forumChildReplayCommentUsers: UserListDTO[][][];
  //#endregion ---------- Comment --------------

  uuid: string | null;

  isLoading: boolean;
  isCategoryLoading: boolean;
  isVoteLoading: boolean;
  isError: boolean;

  paginator?: PaginatorRequest;
  dataRequest?: ParamsRequest;

  pages: number[];
  sortBy: string;

  user: SoeDTO | undefined;
  personalNumber: string;
  commentForm!: FormGroup;
  commentParentId: number | null;

  isShowMoreButtonClicked: boolean;

  //#region ------------- Comment Data Show ----------
  isReplyCommentDataShowLoading: boolean[];
  isChildReplyCommentDataShowLoading: boolean[][];
  //#endregion ---------- Comment Data Show ----------

  //#region ------------- Comment Post --------------
  isReplyCommentShowed: boolean[];
  isChildReplyCommentShowed: boolean[][];
  replyCommentForm!: FormGroup;
  //#endregion ---------- Comment Post --------------

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly localService: LocalService,
    private readonly forumDataService: ForumDataService,
    private readonly forumCommentDataService: ForumCommentDataService,
    private readonly headerService: HeaderService,
    private readonly keycloakService: KeycloakService,
    private readonly formBuilder: FormBuilder,
    private readonly toastr: ToastrService,
    private readonly talkCategoryDataService: TalkCategoryDataService,
    private readonly ForumVoteDataService: ForumVoteDataService,
    private readonly homePageService: HomePageService,
    private readonly forumCommentLikeService: ForumCommentLikeDataService
  ) {
    this.uuid = this.route.snapshot.paramMap.get('uuid');
    this.talkCategoryData = [];
    this.isLoading = false;
    this.isCategoryLoading = false;
    this.isVoteLoading = false;
    this.isError = false;
    this.forumCommentData = [];
    this.isCommentLoading = false;
    this.pages = [];
    this.forumCommentUsers = [];
    this.forumReplayCommentUsers = [[]];
    this.forumChildReplayCommentUsers = [[[]]];
    this.sortBy = 'desc';
    this.personalNumber = '';
    this.commentParentId = null;
    this.isReplyCommentShowed = [];
    this.isChildReplyCommentShowed = [[]];
    this.isReplyCommentDataShowLoading = [];
    this.isChildReplyCommentDataShowLoading = [[]];
    this.isShowMoreButtonClicked = false;
    this.parsedForumDescription = '';
    this.forumUploader = defaultUserListDTO;
  }

  ngOnInit(): void {
    this.initializeUserOptions();
    this.getUserData(this.personalNumber);
    this.initTalkCategoryData();
    this.createPostCommentForm();
  }

  ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.unsubscribe();
  }

  //GET Personal Number from Keycloak
  private initializeUserOptions(): void {
    this.personalNumber = this.keycloakService.getUsername();
  }

  //Get Personal Info from SOE
  private getUserData(
    personal_number: string,
    type?: string,
    index?: number,
    replyIndex?: number,
    childReplyIndex?: number
  ): void {
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
        if (index !== undefined) {
          if (type === 'main-comment') {
            this.forumCommentUsers[index] = response.data;
          } else if (type === 'reply-comment') {
            if (replyIndex !== undefined) {
              this.forumReplayCommentUsers[index][replyIndex] = response.data;
            }
          } else if (type === 'child-reply-comment') {
            if (replyIndex !== undefined && childReplyIndex !== undefined) {
              this.forumChildReplayCommentUsers[index][replyIndex][
                childReplyIndex
              ] = response.data;
            }
          }
        } else {
          this.forumUploader = response.data;
        }
      });
  }

  initTalkCategoryData() {
    const forumCategories = this.localService.getData('forum_categories');
    if (forumCategories !== null) {
      this.talkCategoryData = JSON.parse(forumCategories);
      if (this.selectedTalkCategory === undefined) {
        const selectedCategory = this.localService.getData(
          'selected_forum_category'
        );
        if (selectedCategory !== null) {
          this.selectedTalkCategory = JSON.parse(selectedCategory);
        } else {
          //back to forum page
          this.router.navigate(['/user/nex-talks/forum']);
        }
      }
      this.initForumDetailData(true);
    } else {
      //back to forum page
      //this.router.navigate(['/user/nex-talks/forum-page']);
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
              this.initForumDetailData(true);
            }
          }
        });
    }
  }

  initForumDetailData(refresh?: boolean): void {
    if (this.uuid) {
      if (refresh) {
        this.isLoading = true;
      }
      this.forumDataService
        .getForumDetailDataByUuid(this.uuid)
        .pipe(
          tap((response) => {
            if (response.data.path !== '-') {
              response.data.path =
                environment.httpUrl +
                '/v1/api/file-manager/get-imagepdf/' +
                response.data.path;
            }
            this.parsedForumDescription = this.parseHTML(
              response.data.description
            );
          }),
          takeUntil(this._onDestroy$)
        )
        .subscribe(
          (response) => {
            if (refresh) {
              this.isLoading = false;
            }
            this.forumDetailData = response.data;

            this.initForumCommentPaginator();
            this.initForumCommentParams();
            this.initForumCommentData(response.data.id, true, true);
          },
          () => {
            if (refresh) {
              this.isLoading = false;
            }
            this.isError = true;
          }
        );
    }
  }

  initForumCommentData(
    forumId: number | undefined,
    refresh?: boolean,
    loadUser?: boolean
  ): void {
    if (forumId) {
      if (refresh) {
        this.isCommentLoading = true;
      }
      let params: string = `page=${this.dataRequest?.page ?? 1}&limit=${
        this.dataRequest?.limit
      }`;

      if (this.sortBy) {
        params += `&order_by=${this.sortBy}`;
      }

      params += `&id_forum=${forumId}`;

      this.forumCommentDataService
        .getForumCommentData(params)
        .pipe(
          tap((response) => {
            if (loadUser) {
              this.forumCommentUsers = new Array(
                response.data.data.length
              ).fill(defaultUserListDTO);
              this.forumReplayCommentUsers = new Array(
                response.data.data.length
              ).fill([]);
              this.forumChildReplayCommentUsers = new Array(
                response.data.data.length
              ).fill([]);
            }

            // Begin of Comment Show Data
            this.isReplyCommentDataShowLoading = new Array(
              response.data.data.length
            ).fill(false);
            this.isChildReplyCommentDataShowLoading = new Array(
              response.data.data.length
            ).fill([]);
            // End of Comment Show Data

            // Begin of Post Comment Show
            this.isReplyCommentShowed = new Array(
              response.data.data.length
            ).fill(false);
            this.isChildReplyCommentShowed = new Array(
              response.data.data.length
            ).fill([]);
            // End of Post Comment Show
            response.data.data.map((dt, index) => {
              if (loadUser) {
                this.forumReplayCommentUsers[index] = new Array(
                  dt.childComment.length
                ).fill(defaultUserListDTO);
                this.forumChildReplayCommentUsers[index] = new Array(
                  dt.childComment.length
                ).fill([]);
              }

              // Begin of Comment Show Data
              this.isChildReplyCommentDataShowLoading[index] = new Array(
                dt.childComment.length
              ).fill(false);
              // End of Comment Show Data

              //Begin of Post Comment Show
              this.isChildReplyCommentShowed[index] = new Array(
                dt.childComment.length
              ).fill(false);
              //End of Post Comment Show
              if (loadUser) {
                this.getUserData(dt.personalNumber, 'main-comment', index);
              }

              dt.childComment.map((cd, indexChild) => {
                if (loadUser) {
                  this.getUserData(
                    cd.personalNumber,
                    'reply-comment',
                    index,
                    indexChild
                  );
                }

                if (loadUser) {
                  this.forumChildReplayCommentUsers[index][indexChild] =
                    new Array(cd.childComment.length).fill(defaultUserListDTO);
                  cd.childComment.map((cdc, indexChildComment) => {
                    this.getUserData(
                      cdc.personalNumber,
                      'child-reply-comment',
                      index,
                      indexChild,
                      indexChildComment
                    );
                  });
                }
              });
            });
          }),
          takeUntil(this._onDestroy$)
        )
        .subscribe((response) => {
          this.forumCommentData = response.data.data;
          if (refresh) {
            this.isCommentLoading = false;
          }
          if (this.paginator) {
            this.paginator.totalData = response.data.totalItems;
            this.paginator.totalPage = response.data.totalPages;
            this.pages = new Array(this.paginator.totalPage);
          }
        });
    }
  }

  initForumCommentPaginator(): void {
    this.paginator = {
      pageOption: [3, 6, 12, 25],
      pageNumber: 1,
      pageSize: 3,
      totalData: 0,
      totalPage: 0,
    };
  }

  initForumCommentParams(): void {
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

  onChangeOrderComment(order: string): void {
    if (order === 'New') {
      this.sortBy = 'desc';
    } else {
      this.sortBy = 'top';
    }
    this.commentForm.reset();
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

  changePageSize(): void {
    if (this.paginator) {
      this.paginator.pageNumber = 1;
      this.rePaginate();
    }
  }

  rePaginate(refresh?: boolean): void {
    if (this.paginator) {
      if (refresh) {
        this.paginator.pageNumber = 1;
        this.paginator.pageSize = 3;
      }

      if (this.dataRequest) {
        this.dataRequest.limit = this.paginator.pageSize;
        this.dataRequest.page = this.paginator.pageNumber;
        this.dataRequest.offset =
          (this.paginator.pageNumber - 1) * this.paginator.pageSize;
      }

      this.initForumCommentData(this.forumDetailData?.id, true, true);
    }
  }

  createPostCommentForm(): void {
    this.commentForm = this.formBuilder.nonNullable.group({
      comment: ['', Validators.required],
    });
  }

  get comment() {
    return this.commentForm.get('comment');
  }

  onDeleteComment(uuid: string) {
    this.commentForm.reset();
    Swal.fire({
      icon: 'warning',
      title: 'Delete Confirmation',
      text: 'Are you sure want to delete your comment?',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.isCommentLoading = true;
        this.forumCommentDataService.deleteForumCommentData(uuid).subscribe(
          (success) => {
            this.toastr.success('Successfully deleted the comment', 'Success');
            this.isCommentLoading = false;
            this.initForumCommentData(this.forumDetailData?.id, false, false);
          },
          (error) => {
            this.toastr.error(error.error.message, 'Delete Comment Failed');
            this.isCommentLoading = false;
          }
        );
      }
    });
  }

  onShowReplyCommentForm(
    commentId: number,
    index: number,
    childIndex?: number
  ): void {
    this.isReplyCommentShowed.fill(false);
    this.isChildReplyCommentShowed.map((comments) => {
      comments.fill(false);
    });
    if (childIndex === undefined) {
      if (this.isReplyCommentShowed[index] === false) {
        this.isReplyCommentShowed[index] = true;
      }
    } else {
      if (this.isChildReplyCommentShowed[index][childIndex] === false) {
        this.isChildReplyCommentShowed.map((comments) => {
          comments.fill(false);
        });
        this.isChildReplyCommentShowed[index][childIndex] = true;
      }
    }
    this.commentParentId = commentId;

    if (this.contentInputReplyComment) {
      this.contentInputReplyComment.nativeElement.value = '';
    }

    this.createReplyCommentForm();
  }

  onCloseReplyCommentForm(index: number, childIndex?: number): void {
    if (childIndex === undefined) {
      if (this.isReplyCommentShowed[index] === true) {
        this.isReplyCommentShowed[index] = false;
      }
    } else {
      if (this.isChildReplyCommentShowed[index][childIndex] === true) {
        this.isChildReplyCommentShowed[index][childIndex] = false;
      }
    }

    if (this.contentInputReplyComment) {
      this.contentInputReplyComment.nativeElement.value = '';
    }

    this.replyCommentForm.reset();
  }

  createReplyCommentForm(): void {
    this.replyCommentForm = this.formBuilder.nonNullable.group({
      comment: ['', Validators.required],
    });
  }

  get replyComment() {
    return this.replyCommentForm.get('comment');
  }

  onSubmitComment(form: FormGroup) {
    if (this.forumDetailData) {
      if (form.invalid) {
        return;
      }

      const request = {
        comment:
          form === this.commentForm
            ? this.comment?.value
            : this.replyComment?.value,
        personalNumber: this.personalNumber,
        forumId: this.forumDetailData.id,
        parentId: form === this.commentForm ? null : this.commentParentId,
        createdBy: this.personalNumber,
      };

      this.isCommentLoading = true;
      this.forumCommentDataService.storeForumCommentData(request).subscribe(
        (success) => {
          this.toastr.success('Successfully posted a comment', 'Success');
          this.isCommentLoading = false;
          this.commentForm.reset();
          this.initForumCommentData(this.forumDetailData?.id, false, true);
        },
        (error) => {
          this.toastr.error(error.error.message, 'Post Comment Failed');
          this.isCommentLoading = false;
        }
      );
    }
  }

  onClickCommentCount(index: number, childIndex?: number): void {
    if (this.forumCommentData[index]) {
      if (childIndex === undefined) {
        this.isReplyCommentDataShowLoading[index] = true;
        const request = {
          isChildCommentShow: !this.forumCommentData[index].isChildCommentShow,
        };

        this.forumCommentDataService
          .updateForumCommentChildShow(
            this.forumCommentData[index].uuid,
            request
          )
          .subscribe(
            (success) => {
              this.isReplyCommentDataShowLoading[index] = false;
              this.initForumCommentData(this.forumDetailData?.id, false, false);
            },
            (error) => {
              this.toastr.error(
                error.error.message,
                'Show Reply Comment Failed'
              );
              this.isReplyCommentDataShowLoading[index] = false;
            }
          );
      } else {
        this.isChildReplyCommentDataShowLoading[index][childIndex] = true;

        const request = {
          isChildCommentShow:
            !this.forumCommentData[index].childComment[childIndex]
              .isChildCommentShow,
        };

        this.forumCommentDataService
          .updateForumCommentChildShow(
            this.forumCommentData[index].childComment[childIndex].uuid,
            request
          )
          .subscribe(
            (success) => {
              this.isChildReplyCommentDataShowLoading[index][childIndex] =
                false;
              this.initForumCommentData(this.forumDetailData?.id, false, false);
            },
            (error) => {
              this.toastr.error(
                error.error.message,
                'Show Reply Comment Failed'
              );
              this.isChildReplyCommentDataShowLoading[index][childIndex] =
                false;
            }
          );
      }
    }
  }

  onChangeForumVote(
    forumId: number,
    personalNumber: string,
    isUpvote: boolean
  ): void {
    if (personalNumber === this.forumDetailData?.personalNumber) {
      this.toastr.info('You cannot vote for your own forum', 'Info');
    } else {
      this.isVoteLoading = true;

      const request = {
        forumId: forumId,
        personalNumber: personalNumber,
        isUpvote: isUpvote,
      };

      this.ForumVoteDataService.updateForumVote(request)
        .pipe(takeUntil(this._onDestroy$))
        .subscribe(
          (response) => {
            this.toastr.success('Successfully gave a vote', 'Success');
            this.isVoteLoading = false;
            this.initForumDetailData();
          },
          (error) => {
            this.toastr.error(error.error.message, 'Failed');
            this.isVoteLoading = false;
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

  parseHTML(htmlString: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    return doc.body.innerHTML;
  }

  formattedDate(date: string): string {
    return moment(date).format('LL');
  }

  onClickedShowMoreButton() {
    this.isShowMoreButtonClicked = !this.isShowMoreButtonClicked;
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

  onGotoUserPage(personalNumber: string): void {
    this.router.navigate([`/user/home-page/view-user/${personalNumber}`]);
  }

  @ViewChild('contentInputMainComment', { static: false })
  contentInputMainComment!: ElementRef;
  @ViewChild('contentInputReplyComment', { static: false })
  contentInputReplyComment!: ElementRef;

  cursorCommentIndex: number = 0;
  isCommentClick: boolean = false;

  cursorReplyCommentIndex: number = 0;
  isReplyCommentClick: boolean = false;

  emoji = [
    '😀',
    '😃',
    '😄',
    '😁',
    '😆',
    '😅',
    '😂',
    '🤣',
    '🥲',
    '😊',
    '😇',
    '🙂',
    '🙃',
    '😉',
    '😌',
    '😍',
    '🥰',
    '😘',
    '😗',
    '😙',
    '😚',
    '😋',
    '😛',
    '😝',
    '😜',
    '🤪',
    '🤨',
    '🧐',
    '🤓',
    '😎',
    '🥸',
  ];

  clickEmoji(emoji: string, typeComment: string): void {
    if (typeComment === 'main') {
      const contentInput = this.contentInputMainComment.nativeElement;

      if (this.isCommentClick) {
        contentInput.value =
          String(contentInput.value).slice(0, this.cursorCommentIndex) +
          emoji +
          String(contentInput.value).slice(this.cursorCommentIndex);
      } else {
        contentInput.value += emoji;
      }

      this.comment?.setValue(contentInput.value);
    } else if (typeComment === 'reply') {
      const contentInput = this.contentInputReplyComment.nativeElement;

      if (this.isReplyCommentClick) {
        contentInput.value =
          String(contentInput.value).slice(0, this.cursorReplyCommentIndex) +
          emoji +
          String(contentInput.value).slice(this.cursorReplyCommentIndex);
      } else {
        contentInput.value += emoji;
      }

      this.replyComment?.setValue(contentInput.value);
    }
  }

  onClickInputComment(event: Event, type: string) {
    const textarea = event.target as HTMLTextAreaElement;
    if (type === 'main') {
      this.cursorCommentIndex = textarea.selectionStart;
      this.isCommentClick = true;
    } else if (type === 'reply') {
      this.cursorReplyCommentIndex = textarea.selectionStart;
      this.isReplyCommentClick = true;
    }
  }

  onInputComment(type: string) {
    if (type === 'main') {
      this.isCommentClick = false;
    } else if (type === 'reply') {
      this.isReplyCommentClick = false;
    }
  }

  getFilteredCommentLikeCount(
    likeComment: ForumCommentLikeDTO[],
    value: boolean
  ): number {
    return likeComment.filter((comment) => comment.likeOrdislike === value)
      .length;
  }

  onChangeCommentLike(
    forumId: number,
    commentForumId: number,
    likeOrdislike: boolean
  ) {
    const request = {
      forumId: forumId,
      commentForumId: commentForumId,
      personalNumber: this.personalNumber,
      likeOrdislike: likeOrdislike,
    };

    this.forumCommentLikeService
      .updateForumCommentLike(request)
      .pipe(takeUntil(this._onDestroy$))
      .subscribe((response) => {
        this.initForumCommentData(this.forumDetailData?.id, false, false);
      });
  }
}
