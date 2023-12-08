import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import { NexLearningService } from '../../nex-learning.service';
import { SoeService } from 'src/app/core/soe/soe.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { KeycloakService } from 'keycloak-angular';
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
  faChevronRight,
  faHeart,
  faHeartBroken,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import {
  BestPracticeDTO,
  CommentBestPracticeCreateDTO,
  CommentBestPracticeDTO,
  CommentLikeBestPracticeCreateDTO,
  CommentLikeBestPracticeDTO,
} from '../../dtos/best-practice.dto';
import Swal from 'sweetalert2';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { mergeMap, switchMap, tap } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import { ArticleCommentPostDTO } from '../../dtos/article-comment.dto';

@Component({
  selector: 'app-best-practice-view',
  templateUrl: './best-practice-view.component.html',
  styleUrls: ['./best-practice-view.component.css'],
})
export class BestPracticeViewComponent
  extends BaseController
  implements OnInit, OnDestroy
{
  constructor(
    private readonly activeRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly nexLearningService: NexLearningService,
    private readonly soeService: SoeService,
    private sanitizer: DomSanitizer,
    public readonly keycloakService: KeycloakService
  ) {
    super(BestPracticeViewComponent.name);
  }

  ngOnInit(): void {
    this.activeRoute.params.subscribe((params: Params) => {
      const uuid = params['uuid'];
      this.uuid = uuid;
      this.getBestPracticeByUUID(uuid);
    });
    this.getBestPracticeData();
  }

  ngOnDestroy(): void {}

  urlAvatar: string = environment.httpUrl + '/v1/api/file-manager/avatar/';
  faSearch = faSearch;
  faChevronRight = faChevronRight;
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
  faXmark = faXmark;
  faHeartBroken = faHeartBroken;

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
  articleData: BestPracticeDTO = {
    id: 0,
    uuid: '',
    personalNumber: '',
    title: '',
    content: '',
    image: '',
    path: '',
    uploadBy: '',
    unit: '',
    score: 0,
    approvalStatus: null,
    approvalDesc: null,
    approvalBy: null,
    bannedStatus: false,
    editorChoice: false,
    favorite: false,
    createdAt: null,
    updatedAt: null,
    _count: {
      bestPracticeComment: 0,
    },
  };
  articleList: BestPracticeDTO[] = [];

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

  articleComment: CommentBestPracticeDTO[] = [];
  replyComment: CommentBestPracticeDTO[] = [];

  replyFormVisible: Array<boolean> = [];
  editFormVisible: Array<boolean> = [];
  showReply: Array<boolean> = [];
  editReply: Array<boolean> = [];

  totalComment!: number;
  totalReply!: number;

  async getBestPracticeData(): Promise<void> {
    try {
      this.nexLearningService
        .getBestPractice(1, 5, '', 'trending')
        .pipe(
          tap((data) => {
            data.data.result.forEach((image) => {
              image.path =
                environment.httpUrl +
                '/v1/api/file-manager/get-imagepdf/' +
                image.path;
            });
          })
        )
        .subscribe((article) => {
          this.articleList = this.articleList.concat(article.data.result);
        });
    } catch (error) {
      throw error;
    }
  }

  async getBestPracticeByUUID(uuid: string): Promise<void> {
    try {
      this.nexLearningService
        .getBestPracticeByUuid(uuid)
        .subscribe((response) => {
          this.articleData = response.data;
          this.image =
            environment.httpUrl +
            '/v1/api/file-manager/get-imagepdf/' +
            response.data.path;
          this.isTopComment = true;
          this.getCommentData(
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

  async getBestReplyCommentData(
    parentId: number,
    page: number,
    limit: number,
    sortBy: string
  ): Promise<void> {
    try {
      this.nexLearningService
        .getBestReplyComment(
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

  getSanitizedHTML(htmlString: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(htmlString);
  }

  async getCommentData(
    practiceId: number,
    page: number,
    limit: number,
    sortBy: string
  ): Promise<void> {
    try {
      this.sortBy = sortBy;
      this.page = 1;
      this.nexLearningService
        .getBestComments(practiceId, this.page, limit, this.sortBy)
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
            this.replyComment = [];
            this.editFormVisible = [];
            this.showReply = [];

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

  async getCommentDataMore(
    practiceId: number,
    page: number,
    limit: number,
    sortBy: string
  ): Promise<void> {
    try {
      this.nexLearningService
        .getBestComments(practiceId, this.page + 1, limit, sortBy)
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

  async postComment(parentId: number | null): Promise<void> {
    try {
      if (this.mform.valid) {
        this.page = 1;
        this.soeService
          .getUserData(this.keycloakService.getUsername())
          .subscribe((data) => {
            const dto: CommentBestPracticeCreateDTO = {
              practiceId: this.articleData.id,
              personalNumber: this.keycloakService.getUsername(),
              personalName: data.personalName,
              comment: this.mform.get('comments')?.value,
              parentId: parentId,
              personalNumberMention: null,
              personalNameMention: null,
              like: 0,
              dislike: 0,
            };
            this.nexLearningService.createBestComments(dto).subscribe(() => {
              Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Your Comment Posted!.',
                timer: 1000,
                showConfirmButton: false,
              }).then(() => {
                this.mform.reset();
                this.getCommentData(
                  this.articleData.id,
                  this.page,
                  this.limit,
                  this.sortBy
                );
                this.getBestPracticeByUUID(this.uuid);
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

  async postReplyComment(parentId: number | null): Promise<void> {
    try {
      // if (this.commentsForm.valid) {
      //   this.page = 1;
      //   this.soeService
      //     .getUserData(this.keycloakService.getUsername())
      //     .subscribe((data) => {
      //       const dto: CommentBestPracticeCreateDTO = {
      //         practiceId: this.articleData.id,
      //         personalNumber: this.keycloakService.getUsername(),
      //         personalName: data.personalName,
      //         comment: this.commentsForm.get('comments')?.value,
      //         parentId: parentId,
      //       };
      //       this.nexLearningService.createBestComments(dto).subscribe(() => {
      //         Swal.fire({
      //           icon: 'success',
      //           title: 'Success!',
      //           text: 'Your Comment Posted!.',
      //           timer: 1000,
      //           showConfirmButton: false,
      //         }).then(() => {
      //           this.commentsForm.reset();
      //           this.getCommentData(
      //             this.articleData.id,
      //             this.page,
      //             this.limit,
      //             this.sortBy
      //           );
      //         });
      //       });
      //     });
      // } else {
      //   Swal.fire({
      //     icon: 'error',
      //     title: 'Error!',
      //     text: 'Please check your data before submit.',
      //     timer: 1000,
      //     showConfirmButton: false,
      //   }).then(() => {
      //     Object.keys(this.commentsForm.controls).forEach((key) => {
      //       const control = this.commentsForm.get(key);
      //       if (control?.invalid) {
      //         control.markAsTouched();
      //       }
      //     });
      //   });
      // }
    } catch (error) {
      throw error;
    }
  }

  async editComment(uuid: string, parentId: number | null): Promise<void> {
    try {
      // if (this.commentsFormEdit.valid) {
      //   this.page = 1;
      //   this.soeService
      //     .getUserData(this.keycloakService.getUsername())
      //     .subscribe((data) => {
      //       const dto: CommentBestPracticeCreateDTO = {
      //         practiceId: this.articleData.id,
      //         personalNumber: this.keycloakService.getUsername(),
      //         personalName: data.personalName,
      //         comment: this.commentsForm.get('comments')?.value,
      //         parentId: parentId,
      //       };
      //       this.nexLearningService
      //         .updateBestComments(uuid, dto)
      //         .subscribe(() => {
      //           Swal.fire({
      //             icon: 'success',
      //             title: 'Success!',
      //             text: 'Your Comment Posted!.',
      //             timer: 1000,
      //             showConfirmButton: false,
      //           }).then(() => {
      //             this.commentsForm.reset();
      //             this.getCommentData(
      //               this.articleData.id,
      //               this.page,
      //               this.limit,
      //               this.sortBy
      //             );
      //           });
      //         });
      //     });
      // } else {
      //   Swal.fire({
      //     icon: 'error',
      //     title: 'Error!',
      //     text: 'Please check your data before submit.',
      //     timer: 1000,
      //     showConfirmButton: false,
      //   }).then(() => {
      //     Object.keys(this.commentsForm.controls).forEach((key) => {
      //       const control = this.commentsFormEdit.get(key);
      //       if (control?.invalid) {
      //         control.markAsTouched();
      //       }
      //     });
      //   });
      // }
    } catch (error) {
      throw error;
    }
  }

  async updateComment(
    uuid: string,
    parentId: number | null,
    personalNumber: string,
    comment: string
  ): Promise<void> {
    // if (this.commentsFormEdit.valid) {
    //   this.soeService.getUserData(personalNumber).subscribe((response) => {
    //     const dto: CommentBestPracticeCreateDTO = {
    //       practiceId: this.articleData.id,
    //       personalNumber: personalNumber,
    //       personalName: response.personalName,
    //       comment: comment,
    //       parentId: parentId,
    //     };
    //     this.nexLearningService.updateBestComments(uuid, dto).subscribe(() => {
    //       Swal.fire({
    //         icon: 'success',
    //         title: 'Success!',
    //         text: 'Your Comment Updated!.',
    //         timer: 1000,
    //         showConfirmButton: false,
    //       }).then(() => {
    //         this.commentsForm.reset();
    //         this.getCommentData(
    //           this.articleData.id,
    //           this.page,
    //           this.limit,
    //           this.sortBy
    //         );
    //       });
    //     });
    //   });
    // } else {
    //   Swal.fire({
    //     icon: 'error',
    //     title: 'Error!',
    //     text: 'Please check your data before submit.',
    //     timer: 1000,
    //     showConfirmButton: false,
    //   }).then(() => {
    //     Object.keys(this.commentsFormEdit.controls).forEach((key) => {
    //       const control = this.commentsFormEdit.get(key);
    //       if (control?.invalid) {
    //         control.markAsTouched();
    //       }
    //     });
    //   });
    // }
  }

  async updateReplyComment(
    uuid: string,
    parentId: number | null,
    personalNumber: string,
    comment: string
  ): Promise<void> {
    if (this.commentsSubFormEdit.valid) {
      this.soeService.getUserData(personalNumber).subscribe((response) => {
        const dto: CommentBestPracticeCreateDTO = {
          practiceId: this.articleData.id,
          personalNumber: personalNumber,
          personalName: response.personalName,
          comment: comment,
          parentId: parentId,
          personalNumberMention: null,
          personalNameMention: null,
          like: 0,
          dislike: 0,
        };
        this.nexLearningService.updateBestComments(uuid, dto).subscribe(() => {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Your Comment Updated!.',
            timer: 1000,
            showConfirmButton: false,
          }).then(() => {
            this.commentsFormEdit.reset();
            this.getCommentData(
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
  }

  async likeOrDislike(
    bestPracticeId: number,
    commentBestPracticeId: number,
    likeOrdislike: boolean
  ): Promise<void> {
    try {
      this.loadingComment = true;
      const dto: CommentLikeBestPracticeCreateDTO = {
        bestPracticeId: bestPracticeId,
        commentBestPracticeId: commentBestPracticeId,
        likeOrdislike: likeOrdislike,
        personalNumber: this.keycloakService.getUsername(),
      };
      this.nexLearningService
        .likeDislikeCommentBest(
          bestPracticeId,
          commentBestPracticeId,
          this.keycloakService.getUsername(),
          dto
        )
        .subscribe(() => {
          this.getCommentData(
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
        this.nexLearningService.deleteBestComment(uuid).subscribe(() => {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Your Comment Deleted!.',
            timer: 1000,
            showConfirmButton: false,
          }).then(() =>
            this.getCommentData(
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

  cekDataLike(data: Array<CommentLikeBestPracticeDTO>): boolean | null {
    const cek = data.find(
      (ck) => ck.personalNumber === this.keycloakService.getUsername()
    );
    if (cek) {
      return cek.likeOrdislike;
    }
    return null;
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
    this.getBestReplyCommentData(id, 1, 5, this.sortBy);
    this.showReply[i] = !this.showReply[i];
    if (this.showReply[i]) {
      this.showReply = this.showReply.map(() => false);
      this.resetTrueFalse();
      this.showReply[i] = !this.showReply[i];
    }
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

  async updateReplyCommentData(uuid: string): Promise<void> {
    try {
      if (this.commentsFormEdit.valid) {
        this.soeService
          .getUserData(this.keycloakService.getUsername())
          .subscribe((response) => {
            const dto: CommentBestPracticeCreateDTO = {
              practiceId: this.articleData.id,
              personalNumber: response.personalNumber,
              personalName: response.personalName,
              comment: this.commentsFormEdit.get('comments')?.value,
              parentId: null,
              like: 0,
              personalNumberMention: this.personalNumberMention,
              personalNameMention: this.personalNumberMention,
              dislike: 0,
            };
            this.nexLearningService
              .updateBestComments(uuid, dto)
              .subscribe(() => {
                Swal.fire({
                  icon: 'success',
                  title: 'Success!',
                  text: 'Your Comment Updated!.',
                  timer: 1000,
                  showConfirmButton: false,
                }).then(() => {
                  this.commentsFormEdit.reset();
                  this.getCommentData(
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

  loadPostReply!: boolean;
  async createReplyCommentData(): Promise<void> {
    try {
      this.loadPostReply = false;
      if (this.commentsForm.valid) {
        this.soeService
          .getUserData(this.keycloakService.getUsername())
          .subscribe((response) => {
            const dto: CommentBestPracticeCreateDTO = {
              practiceId: this.articleData.id,
              personalNumber: response.personalNumber,
              personalName: response.personalName,
              comment: this.commentsForm.get('comments')?.value,
              parentId: this.parentIdReply,
              like: 0,
              personalNumberMention: this.personalNumberMention,
              personalNameMention: this.personalNameMention,
              dislike: 0,
            };
            this.nexLearningService.createBestComments(dto).subscribe(() => {
              Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Your Comment Posted!.',
                timer: 1000,
                showConfirmButton: false,
              }).then(() => {
                this.commentsForm.reset();
                this.getCommentData(
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

  toggleShowReplyMore(i: number, id: number): void {
    if (this.showReply[i] === true) {
      this.getBestReplyCommentData(id, 2, this.limit, this.sortBy);
    }
  }
  toggleHideReplyMore(i: number, id: number): void {
    this.showReply[i] = false;
    this.replyComment = [];
  }
}
