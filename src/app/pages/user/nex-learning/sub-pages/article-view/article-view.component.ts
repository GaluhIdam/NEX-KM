import {
  ArticleCommentLikeDTO,
  ArticleCommentLikePostDTO,
} from '../../dtos/article-comment-like.dto';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { NexLearningService } from '../../nex-learning.service';
import { ArticlesDTO } from '../../dtos/articles.dto';
import {
  faArrowRight,
  faBookBookmark,
  faBookOpen,
  faComment,
  faSearch,
  faChevronUp,
  faChevronDown,
  faCircleCheck,
  faPaperPlane,
  faArrowLeft,
  faHeart,
  faThumbsDown,
  faXmark,
  faChevronRight,
  faHeartBroken
} from '@fortawesome/free-solid-svg-icons';

import { faHeart as faHeartBorder } from '@fortawesome/free-regular-svg-icons';
import {
  ArticleCommentDTO,
  ArticleCommentPostDTO,
} from '../../dtos/article-comment.dto';
import { SoeService } from 'src/app/core/soe/soe.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ArticleCategoryDTO } from '../../dtos/article-category.dto';
import { mergeMap, tap } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import {
  Tooltip,
  Dropdown,
  Animate,
  initTE,
} from "tw-elements";

@Component({
  selector: 'app-article-view',
  templateUrl: './article-view.component.html',
  styleUrls: ['./article-view.component.css'],
})
export class ArticleViewComponent
  extends BaseController
  implements OnInit, OnDestroy
{
  constructor(
    private readonly activeRoute: ActivatedRoute,
    private readonly nexLearningService: NexLearningService,
    private readonly soeService: SoeService,
    private sanitizer: DomSanitizer,
    public readonly keycloakService: KeycloakService
  ) {
    super(ArticleViewComponent.name);
  }
  ngOnInit(): void {
    initTE({ Tooltip, Dropdown, Animate });
    this.activeRoute.params.subscribe((params: Params) => {
      const uuid = params['uuid'];
      this.uuid = uuid;
      this.getArticleId(uuid);
    });
    this.getArticle();
  }

  ngOnDestroy(): void {}

  //----------------------------------------------------------------------
  urlAvatar: string = environment.httpUrl + '/v1/api/file-manager/avatar/';
  faSearch = faSearch;
  faArrowRight = faArrowRight;
  faBookBookmark = faBookBookmark;
  faBookOpen = faBookOpen;
  faComment = faComment;
  faChevronUp = faChevronUp;
  faChevronDown = faChevronDown;
  faCircleCheck = faCircleCheck;
  faPaperPlane = faPaperPlane;
  faArrowLeft = faArrowLeft;
  faHeart = faHeart;
  faThumbsDown = faThumbsDown;
  faChevronRight = faChevronRight;
  faHeartBorder = faHeartBorder;
  faHeartBroken = faHeartBroken;
  faXmark = faXmark;

  loadingComment!: boolean;
  loading: boolean = true;
  id!: number;
  uuid!: string;
  page: number = 1;
  limit: number = 5;
  pageReply: number = 1;
  limitReply: number = 5;
  sortBy: string = 'trending';
  image!: string;

  //ARTICLE SECTION
  isTopComment!: Boolean;
  articleData: ArticlesDTO<ArticleCategoryDTO> = {
    id: 0,
    personalNumber: null,
    uuid: '',
    title: null,
    content: null,
    image: null,
    path: null,
    uploadBy: null,
    unit: null,
    approvalStatus: false,
    approvalDesc: null,
    approvalBy: null,
    editorChoice: false,
    updatedAt: null,
    _count: {
      articleComment: 0,
    },
    score: null,
    bannedStatus: null,
    articleCategory: null,
  };
  articleList: ArticlesDTO<ArticleCategoryDTO>[] = [];
  pageArticle: number = 1;
  limitArticle: number = 5;
  totalArticle!: number;

  mform: FormGroup = new FormGroup({
    comments: new FormControl('', [Validators.required]),
  });

  commentsForm: FormGroup = new FormGroup({
    comments: new FormControl('', [Validators.required]),
  });

  commentsFormEdit: FormGroup = new FormGroup({
    comments: new FormControl('', [Validators.required]),
  });

  commentsSubFormEdit: FormGroup = new FormGroup({
    comments: new FormControl('', [Validators.required]),
  });

  articleComment: ArticleCommentDTO[] = [];
  replyComment: ArticleCommentDTO[] = [];

  replyFormVisible: Array<boolean> = [];
  editFormVisible: Array<boolean> = [];
  showReply: Array<boolean> = [];
  editReply: Array<boolean> = [];
  totalComment!: number;
  totalReply!: number;

  async getArticle(): Promise<void> {
    try {
      this.nexLearningService
        .getArticleData(1, 4, '', 'trending')
        .pipe(
          tap((data) => {
            if (data.data.result) {
              data.data.result.forEach((result) => {
                result.path =
                  environment.httpUrl +
                  '/v1/api/file-manager/get-imagepdf/' +
                  result.path;
              });
            }
          })
        )
        .subscribe((article) => {
          this.articleList = article.data.result;
          this.totalArticle = article.data.total;
        });
    } catch (error) {
      throw error;
    }
  }

  async getArticleId(uuid: string): Promise<void> {
    try {
      this.nexLearningService.getArticleDataId(uuid).subscribe((response) => {
        this.articleData = response.data;
        this.image =
          environment.httpUrl +
          '/v1/api/file-manager/get-imagepdf/' +
          response.data.path;
        this.isTopComment = true;
        this.getCommentDataArticle(
          response.data.id,
          this.page,
          this.limit,
          this.sortBy
        );
      });
    } catch (error) {
      throw error;
    }
  }
  //ARTICLE SECTION

  async getCommentDataArticle(
    articleId: number,
    page: number,
    limit: number,
    sortBy: string
  ): Promise<void> {
    try {
      this.sortBy = sortBy;
      this.page = 1;
      this.nexLearningService
        .getCommentData(this.page, limit, articleId, sortBy)
        .subscribe((response) => {
          this.totalComment = response.data.total;
          if (this.sortBy == 'trending') {
            this.isTopComment = false;
          }
          if (this.sortBy == 'desc') {
            this.isTopComment = true;
          }
          this.articleComment = response.data.result;
          if (this.articleComment) {
            this.replyFormVisible = this.articleComment.map(() => false);
            this.editFormVisible = this.articleComment.map(() => false);
            this.showReply = this.articleComment.map(() => false);
          }
          this.loadingComment = false;
          this.loading = false;
        });
    } catch (error) {
      throw error;
    }
  }

  async getBestReplyCommentData(
    articleId: number,
    parentId: number,
    page: number,
    limit: number,
    sortBy: string
  ): Promise<void> {
    try {
      this.nexLearningService
        .getChildComment(
          articleId,
          parentId,
          (this.pageReply = page != 1 ? this.pageReply + 1 : 1),
          limit,
          sortBy
        )
        .pipe(
          tap(() => (this.pageReply = page != 1 ? this.pageReply + 1 : 1)),
          tap((value) => (this.totalReply = value.data.total)),
          mergeMap((value) => {
            if (value.data.result && page != 1) {
              return (this.replyComment = this.replyComment.concat(
                value.data.result
              ));
            }
            if (value.data.result && page == 1) {
              this.replyComment = [];
              return (this.replyComment = this.replyComment.concat(
                value.data.result
              ));
            }
            return (this.replyComment = []);
          })
        )
        .subscribe((response) => {
          if (this.replyComment) {
            this.editReply = this.replyComment.map(() => false);
          }
        });
    } catch (error) {
      throw error;
    }
  }

  async getCommentDataMore(
    articleId: number,
    page: number,
    limit: number,
    sortBy: string
  ): Promise<void> {
    try {
      this.nexLearningService
        .getCommentData(this.page + 1, limit, articleId, sortBy)
        .pipe(
          tap(() => (this.page = this.page + 1)),
          tap((value) => (this.totalComment = value.data.total)),
          mergeMap(
            (value) =>
              (this.articleComment = this.articleComment.concat(
                value.data.result
              ))
          )
        )
        .subscribe((response) => {
          this.replyFormVisible = this.articleComment.map(() => false);
          this.editFormVisible = this.articleComment.map(() => false);
          this.showReply = this.articleComment.map(() => false);
        });
    } catch (error) {
      throw error;
    }
  }

  async createCommentData(): Promise<void> {
    try {
      if (this.mform.valid) {
        this.soeService
          .getUserData(this.keycloakService.getUsername())
          .subscribe((response) => {
            const dto: ArticleCommentPostDTO = {
              articleId: this.articleData.id,
              personalNumber: response.personalNumber,
              personalName: response.personalName,
              comment: this.mform.get('comments')?.value,
              parentId: null,
              like: 0,
              personalNumberMention: null,
              personalNameMention: null,
            };
            this.nexLearningService.createComment(dto).subscribe(() => {
              Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Your Comment Posted!.',
                timer: 1000,
                showConfirmButton: false,
              }).then(() => {
                this.mform.reset();
                this.getCommentDataArticle(
                  this.articleData.id,
                  this.page,
                  this.limit,
                  this.sortBy
                );
              });
            });
          });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Your comment is empty!',
          timer: 1000,
          showConfirmButton: false,
        }).then(() => {
          Object.keys(this.mform.controls).forEach((key) => {
            const control = this.mform.get(key);
            if (control?.invalid) {
              control.markAsTouched();
            }
          });
        });
      }
    } catch (error) {
      throw error;
    }
  }

  parentIdReply!: number | null;
  personalNumberMention!: string | null;
  personalNameMention!: string | null;
  commentReplyMention!: string;
  tagReplyCommentId(
    parentId: number | null,
    personalNameMention: string | null,
    personalNumberMention: string | null,
    commentReplyMention: string
  ): void {
    this.parentIdReply = parentId;
    this.personalNameMention = personalNameMention;
    this.personalNumberMention = personalNumberMention;
    this.commentReplyMention = commentReplyMention;
  }

  loadPostReply!: boolean;
  async createReplyCommentData(): Promise<void> {
    try {
      this.loadPostReply = false;
      if (this.commentsForm.valid) {
        this.soeService
          .getUserData(this.keycloakService.getUsername())
          .subscribe((response) => {
            const dto: ArticleCommentPostDTO = {
              articleId: this.articleData.id,
              personalNumber: response.personalNumber,
              personalName: response.personalName,
              comment: this.commentsForm.get('comments')?.value,
              parentId: this.parentIdReply,
              like: 0,
              personalNumberMention: this.personalNumberMention,
              personalNameMention: this.personalNameMention,
            };
            this.nexLearningService.createComment(dto).subscribe(() => {
              Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Your Comment Posted!.',
                timer: 1000,
                showConfirmButton: false,
              }).then(() => {
                this.commentsForm.reset();
                this.getCommentDataArticle(
                  this.articleData.id,
                  this.page,
                  this.limit,
                  this.sortBy
                );
                this.closeReplyComment();
              });
            });
          });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Please fill a your comment!',
          timer: 1000,
          showConfirmButton: false,
        }).then(() => {
          Object.keys(this.commentsForm.controls).forEach((key) => {
            const control = this.commentsForm.get(key);
            if (control?.invalid) {
              control.markAsTouched();
            }
          });
        });
      }
    } catch (error) {
      throw error;
    }
  }

  async updateReplyCommentData(uuid: string): Promise<void> {
    try {
      if (this.commentsFormEdit.valid) {
        this.soeService
          .getUserData(this.keycloakService.getUsername())
          .subscribe((response) => {
            const dto: ArticleCommentPostDTO = {
              articleId: this.articleData.id,
              personalNumber: response.personalNumber,
              personalName: response.personalName,
              comment: this.commentsFormEdit.get('comments')?.value,
              parentId: null,
              like: 0,
              personalNumberMention: this.personalNumberMention,
              personalNameMention: this.personalNumberMention,
            };
            this.nexLearningService.updateComment(uuid, dto).subscribe(() => {
              Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Your Comment Updated!.',
                timer: 1000,
                showConfirmButton: false,
              }).then(() => {
                this.commentsFormEdit.reset();
                this.getCommentDataArticle(
                  this.articleData.id,
                  this.page,
                  this.limit,
                  this.sortBy
                );
              });
            });
          });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Please check your data before submit.',
          timer: 1000,
          showConfirmButton: false,
        }).then(() => {
          Object.keys(this.commentsFormEdit.controls).forEach((key) => {
            const control = this.commentsFormEdit.get(key);
            if (control?.invalid) {
              control.markAsTouched();
            }
          });
        });
      }
    } catch (error) {
      throw error;
    }
  }

  async updateSubReplyCommentData(
    uuid: string,
    parentId: number
  ): Promise<void> {
    try {
      if (this.commentsSubFormEdit.valid) {
        this.soeService
          .getUserData(this.keycloakService.getUsername())
          .subscribe((response) => {
            const dto: ArticleCommentPostDTO = {
              articleId: this.articleData.id,
              personalNumber: response.personalNumber,
              personalName: response.personalName,
              comment: this.commentsSubFormEdit.get('comments')?.value,
              parentId: parentId,
              like: 0,
              personalNumberMention: this.personalNumberMention,
              personalNameMention: this.personalNumberMention,
            };
            this.nexLearningService.updateComment(uuid, dto).subscribe(() => {
              Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Your Comment Updated!.',
                timer: 1000,
                showConfirmButton: false,
              }).then(() => {
                this.commentsSubFormEdit.reset();
                this.getCommentDataArticle(
                  this.articleData.id,
                  this.page,
                  this.limit,
                  this.sortBy
                );
              });
            });
          });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Please check your data before submit.',
          timer: 1000,
          showConfirmButton: false,
        }).then(() => {
          Object.keys(this.commentsSubFormEdit.controls).forEach((key) => {
            const control = this.commentsSubFormEdit.get(key);
            if (control?.invalid) {
              control.markAsTouched();
            }
          });
        });
      }
    } catch (error) {
      throw error;
    }
  }

  cekDataLike(data: Array<ArticleCommentLikeDTO>): boolean | null {
    const cek = data.find(
      (ck) => ck.personalNumber === this.keycloakService.getUsername()
    );
    if (cek) {
      return cek.likeOrdislike;
    }
    return null;
  }

  async likeOrDislike(
    articleId: number,
    commentArticleId: number,
    likeOrdislike: boolean
  ): Promise<void> {
    try {
      this.loadingComment = true;
      const dto: ArticleCommentLikePostDTO = {
        articleId: articleId,
        commentArticleId: commentArticleId,
        likeOrdislike: likeOrdislike,
        personalNumber: this.keycloakService.getUsername(),
      };
      this.nexLearningService
        .likeDislikeComment(
          articleId,
          commentArticleId,
          this.keycloakService.getUsername(),
          dto
        )
        .subscribe(() => {
          this.getCommentDataArticle(
            this.articleData.id,
            this.page,
            this.limit,
            this.sortBy
          );
        });
    } catch (error) {
      throw error;
    }
  }

  async deleteComment(uuid: string): Promise<void> {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.nexLearningService.deleteComment(uuid).subscribe(() => {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Your Comment Deleted!.',
            timer: 1000,
            showConfirmButton: false,
          }).then(() =>
            this.getCommentDataArticle(
              this.articleData.id,
              this.page,
              this.limit,
              this.sortBy
            )
          );
        });
      }
    });
  }

  //Decode HTML
  getSanitizedHTML(htmlString: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(htmlString);
  }

  toggleReply(i: number): void {
    if (!this.replyFormVisible[i]) {
      this.replyFormVisible = this.replyFormVisible.map(() => false);
      this.editFormVisible = this.editFormVisible.map(() => false);
    }
    this.replyFormVisible[i] = !this.replyFormVisible[i];
    if (this.editFormVisible[i]) {
      this.editFormVisible[i] = !this.replyFormVisible[i];
    }
  }

  toggleEditComment(i: number, comment: string): void {
    if (!this.editFormVisible[i]) {
      this.replyFormVisible = this.replyFormVisible.map(() => false);
      this.editFormVisible = this.editFormVisible.map(() => false);
    }
    this.editFormVisible[i] = !this.editFormVisible[i];
    if (this.replyFormVisible[i]) {
      this.replyFormVisible[i] = !this.editFormVisible[i];
    }
    this.commentsFormEdit.get('comments')?.setValue(comment);
  }

  toggleShowReply(i: number, id: number): void {
    this.showReply[i] = !this.showReply[i];
    if (this.showReply[i] === true) {
      this.getBestReplyCommentData(
        this.articleData.id,
        id,
        1,
        this.limit,
        this.sortBy
      );
    }
    if (this.showReply[i]) {
      this.showReply = this.showReply.map(() => false);
      this.resetTrueFalse();
      this.showReply[i] = !this.showReply[i];
    }
  }

  toggleShowReplyMore(i: number, id: number): void {
    if (this.showReply[i] === true) {
      this.getBestReplyCommentData(
        this.articleData.id,
        id,
        2,
        this.limit,
        this.sortBy
      );
    }
  }
  toggleHideReplyMore(i: number, id: number): void {
    this.showReply[i] = false;
    this.replyComment = [];
  }

  toggleEditReplyComment(i: number, comments: string): void {
    if (!this.editReply[i]) {
      this.editReply = this.editReply.map(() => false);
    }
    this.editReply[i] = !this.editReply[i];
    this.commentsSubFormEdit.get('comments')?.setValue(comments);
  }

  resetTrueFalse(): void {
    this.replyFormVisible = this.replyFormVisible.map(() => false);
    this.editFormVisible = this.editFormVisible.map(() => false);
    this.editReply = this.editReply.map(() => false);
  }

  // For Post Comment
  @ViewChild('autoResizeTextareaCreate') autoResizeTextareaCreate!: ElementRef;
  onInputCommentCreate(event: Event) {
    const textarea = this.autoResizeTextareaCreate.nativeElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  // For Edit Comment
  @ViewChild('autoResizeTextareaEdit') autoResizeTextareaEdit!: ElementRef;
  onInputEdit(event: Event) {
    const textarea = this.autoResizeTextareaEdit.nativeElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  // For Edit Reply
  @ViewChild('autoResizeTextarea') autoResizeTextarea!: ElementRef;
  onInput(event: Event) {
    const textarea = this.autoResizeTextarea.nativeElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  @ViewChild('contentInput', { static: false }) contentInput!: ElementRef;

  clickEmoji(emoji: string): void {
    const contentInput = this.contentInput.nativeElement;
    contentInput.value += emoji;
    this.mform.get('content')?.setValue(contentInput.value);
  }

  closeReplyComment(): void {
    this.parentIdReply = null;
    this.mform.get('content')?.setValue('');
  }

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
}

