import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  faUsers,
  faLocationPin,
  faCalendar,
  faChevronRight,
  faChevronLeft,
  faPlus,
  faArrowRight,
  faPaperPlane,
  faComment,
  faHeart,
  faHeartBroken,
  faXmark,
  faChevronUp,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';
import {
  CommentActivityDTO,
  CommentActivityLikeDTO,
  CommunityDTO,
  CreateCommentActivityDTO,
  CreateCommunityLikeDTO,
  RecentActivityDTO,
} from '../../dto/community.dto';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import { NexCommunityService } from '../../nex-community.service';
import { NexLearningService } from '../../../nex-learning/nex-learning.service';
import { KeycloakService } from 'keycloak-angular';
import { SoeService } from 'src/app/core/soe/soe.service';
import { Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-activity',
  templateUrl: './view-activity.component.html',
  styleUrls: ['./view-activity.component.css'],
})
export class ViewActivityComponent
  extends BaseController
  implements OnInit, OnDestroy
{
  constructor(
    private readonly router: Router,
    private readonly activeRoute: ActivatedRoute,
    private readonly nexcommunityService: NexCommunityService,
    private readonly nexlearningService: NexLearningService,
    readonly keycloakService: KeycloakService,
    private readonly soeService: SoeService
  ) {
    super(ViewActivityComponent.name);
  }

  urlAvatar: string = environment.httpUrl + '/v1/api/file-manager/avatar/';
  faUsers = faUsers;
  faLocationPin = faLocationPin;
  faCalendar = faCalendar;
  faChevronRight = faChevronRight;
  faChevronLeft = faChevronLeft;
  faArrowRight = faArrowRight;
  faPaperPlane = faPaperPlane;
  faComment = faComment;
  faHeart = faHeart;
  faHeartBroken = faHeartBroken;
  faXmark = faXmark;
  faChevronUp = faChevronUp;
  faChevronDown = faChevronDown;

  uuid!: string;
  id!: number;
  email!: string;
  photo!: string;

  page: number = 1;
  limit: number = 10;
  sortBy: string = 'trending';

  personalName!: string;
  activityDetail: RecentActivityDTO = {
    id: 0,
    uuid: '',
    communityId: 0,
    title: '',
    description: '',
    photo: '',
    path: '',
    personalNumber: '',
    createdAt: null,
    updatedAt: null,
    personalName: '',
    communityActivitiesCommunities: {
      id: 0,
      uuid: '',
      name: '',
      personalNumber: '',
      location: '',
      about: '',
      leader: '',
      leaderPersonalNumber: '',
      leaderProfile: '',
      instagram: '',
      statusPublish: false,
      bannedStatus: false,
      thumbnailPhoto: '',
      thumbnailPhotoPath: '',
      headlinedPhoto: '',
      headlinedPhotoPath: '',
      createdAt: null,
      updatedAt: null,
      _count: {
        communitiesCommunityActivities: 0,
        communitiesCommunityFollows: 0,
        communitiesCommunityMembers: 0,
      },
      icon: '',
      founded: new Date(),
    },
  };
  communityDetail: CommunityDTO = {
    id: 0,
    uuid: '',
    name: '',
    personalNumber: '',
    location: '',
    about: '',
    leader: '',
    leaderProfile: '',
    instagram: '',
    statusPublish: false,
    bannedStatus: false,
    thumbnailPhoto: '',
    thumbnailPhotoPath: '',
    headlinedPhoto: '',
    headlinedPhotoPath: '',
    createdAt: null,
    updatedAt: null,
    _count: {
      communitiesCommunityActivities: 0,
      communitiesCommunityFollows: 0,
      communitiesCommunityMembers: 0,
    },
    leaderPersonalNumber: '',
    icon: '',
    founded: new Date(),
  };

  commentActivity: CommentActivityDTO[] = [];

  replyFormVisible: Array<boolean> = [];
  editFormVisible: Array<boolean> = [];
  showReply: Array<boolean> = [];
  editReply: Array<boolean> = [];
  totalComment!: number;

  totalReply!: number;
  pageReply: number = 1;
  limitReply: number = 5;
  replyComment: CommentActivityDTO[] = [];

  mform: FormGroup = new FormGroup({
    comments: new FormControl('', [Validators.required]),
  });

  commentsForm: FormGroup = new FormGroup({
    comments: new FormControl('', [Validators.required]),
  });

  ngOnDestroy(): void {}
  ngOnInit(): void {
    this.activeRoute.params.subscribe((params: Params) => {
      const uuid = params['uuid'];
      this.uuid = params['uuid'];
      this.getByIdCommunity(uuid);
      this.getActivityByUUID(params['id']);
    });
  }

  //Get Data Communuty
  async getByIdCommunity(uuid: string): Promise<void> {
    try {
      this.nexcommunityService
        .getCommunityById(uuid)
        .pipe(
          tap((data) => {
            data.data.headlinedPhotoPath =
              environment.httpUrl +
              '/v1/api/file-manager/get-imagepdf/' +
              data.data.headlinedPhotoPath;
            data.data.thumbnailPhotoPath =
              environment.httpUrl +
              '/v1/api/file-manager/get-imagepdf/' +
              data.data.thumbnailPhotoPath;
          })
        )
        .subscribe((response) => {
          this.id = response.data.id;
          this.communityDetail = response.data;
          this.soeService
            .getUserData(response.data.leaderPersonalNumber)
            .subscribe((data) => {
              this.personalName = data.personalName;
            });
          this.checkphoto(response.data.leaderPersonalNumber);
        });
    } catch (error) {
      throw error;
    }
  }

  async getActivityByUUID(uuid: string): Promise<void> {
    try {
      this.nexcommunityService
        .getActivityByUuid(uuid)
        .pipe(
          tap((data) => {
            data.data.path =
              environment.httpUrl +
              '/v1/api/file-manager/get-imagepdf/' +
              data.data.path;
          })
        )
        .subscribe((response) => {
          this.activityDetail = response.data;
          this.soeService
            .getUserData(response.data.personalNumber)
            .subscribe((data) => {
              this.email = data.personalEmail;
            });
          this.getCommentActivity(
            this.page,
            this.limit,
            response.data.id,
            this.sortBy
          );
        });
    } catch (error) {
      throw error;
    }
  }

  //Check Photo
  private checkphoto(personal_number: any) {
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

  async getCommentActivity(
    page: number,
    limit: number,
    activityId: number,
    sortBy: string
  ): Promise<void> {
    try {
      this.nexcommunityService
        .getActivityComment(page, limit, activityId, sortBy)
        .subscribe((response) => {
          if (response.data.result) {
            this.commentActivity = response.data.result;
            this.totalComment = response.data.total;
            this.showReply = this.commentActivity.map(() => false);
          }
        });
    } catch (error) {
      throw error;
    }
  }

  async getReplyCommentActivity(
    page: number,
    limit: number,
    activityId: number,
    parentId: number,
    sortBy: string
  ): Promise<void> {
    try {
      this.nexcommunityService
        .getActivityReplyComment(page, limit, activityId, parentId, sortBy)
        .subscribe((response) => {
          console.log(response);
          this.replyComment = response.data.result;
          this.totalReply = response.data.total;
        });
    } catch (error) {
      throw error;
    }
  }

  toggleShowReply(i: number, id: number): void {
    this.showReply[i] = !this.showReply[i];
    if (this.showReply[i] === true) {
      this.getReplyCommentActivity(
        1,
        this.limit,
        this.activityDetail.id,
        id,
        this.sortBy
      );
    }
    if (this.showReply[i]) {
      this.showReply = this.showReply.map(() => false);
      // this.resetTrueFalse();
      this.showReply[i] = !this.showReply[i];
    }
  }

  toggleHideReplyMore(i: number, id: number): void {
    this.showReply[i] = false;
    this.replyComment = [];
  }

  // For Post Comment
  @ViewChild('autoResizeTextarea') autoResizeTextarea!: ElementRef;
  onInput(event: Event) {
    const textarea = this.autoResizeTextarea.nativeElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  @ViewChild('autoResizeTextareaCreate') autoResizeTextareaCreate!: ElementRef;
  onInputCommentCreate(event: Event) {
    const textarea = this.autoResizeTextareaCreate.nativeElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  async createCommentData(): Promise<void> {
    try {
      this.soeService
        .getUserData(this.keycloakService.getUsername())
        .subscribe((data) => {
          const dto: CreateCommentActivityDTO = {
            activityId: this.activityDetail.id,
            personalNumber: this.keycloakService.getUsername(),
            personalName: data.personalName,
            comment: this.mform.get('comments')?.value,
            parentId: null,
            personalNumberMention: null,
            personalNameMention: null,
          };
          this.nexcommunityService.createActivityComment(dto).subscribe(() => {
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Your Comment Posted!.',
              timer: 1000,
              showConfirmButton: false,
            }).then(() => {
              this.mform.get('comments')?.setValue(null);
              this.getCommentActivity(
                this.page,
                this.limit,
                this.id,
                this.sortBy
              );
            });
          });
        });
    } catch (error) {
      throw error;
    }
  }

  //Reply
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

  closeReplyComment(): void {
    this.parentIdReply = null;
    this.mform.get('content')?.setValue('');
  }

  @ViewChild('contentInput', { static: false }) contentInput!: ElementRef;

  clickEmoji(emoji: string): void {
    const contentInput = this.contentInput.nativeElement;
    contentInput.value += emoji;
    this.mform.get('content')?.setValue(contentInput.value);
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

  //Create Reply Comment
  async createReplyCommentData(): Promise<void> {
    try {
      if (this.commentsForm.valid) {
        this.soeService
          .getUserData(this.keycloakService.getUsername())
          .subscribe((response) => {
            const dto: CreateCommentActivityDTO = {
              activityId: this.activityDetail.id,
              personalNumber: response.personalNumber,
              personalName: response.personalName,
              comment: this.commentsForm.get('comments')?.value,
              parentId: this.parentIdReply,
              personalNumberMention: this.personalNumberMention,
              personalNameMention: this.personalNameMention,
            };
            this.nexcommunityService.createActivityComment(dto).subscribe(() =>
              Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Your Comment Posted!.',
                timer: 1000,
                showConfirmButton: false,
              }).then(() => {
                this.commentsForm.reset();
                this.closeReplyComment();
                this.getCommentActivity(
                  this.page,
                  this.limit,
                  this.id,
                  this.sortBy
                );
              })
            );
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

  cekDataLike(data: Array<CommentActivityLikeDTO>): boolean | null {
    const cek = data.find(
      (ck) => ck.personalNumber === this.keycloakService.getUsername()
    );
    if (cek) {
      return cek.likeOrdislike;
    }
    return null;
  }

  async likeOrDislike(
    activityId: number,
    commentActivityId: number,
    likeOrdislike: boolean
  ): Promise<void> {
    try {
      const dto: CreateCommunityLikeDTO = {
        likeOrdislike: likeOrdislike,
        personalNumber: this.keycloakService.getUsername(),
        activityId: activityId,
        commentActivityId: commentActivityId,
      };
      this.nexcommunityService.likeOrDislike(dto).subscribe(() => {
        this.getCommentActivity(this.page, this.limit, this.id, this.sortBy);
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
        this.nexcommunityService.deleteActivityComment(uuid).subscribe(() => {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Your Comment Deleted!.',
            timer: 1000,
            showConfirmButton: false,
          }).then(() => {
            this.getCommentActivity(
              this.page,
              this.limit,
              this.id,
              this.sortBy
            );
          });
        });
      }
    });
  }
}
