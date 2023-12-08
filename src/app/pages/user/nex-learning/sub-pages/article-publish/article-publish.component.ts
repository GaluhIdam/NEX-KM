import { Component, OnDestroy, OnInit } from '@angular/core';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import { NexLearningService } from '../../nex-learning.service';
import { ArticleCategoryDTO } from '../../dtos/article-category.dto';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ArticlePublishDTO } from '../../dtos/articles.dto';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { Select, initTE } from 'tw-elements';
import {
  faChevronRight,
  faBookBookmark,
  faBookOpen,
  faCommentDots,
  faSearch,
  faNewspaper,
  faRefresh,
} from '@fortawesome/free-solid-svg-icons';
import { SummernoteOptions } from 'ngx-summernote/lib/summernote-options';
import { NotificationRequestDTO } from '../../../home-page/dtos/notification.dto';
import { SocketService } from 'src/app/core/utility/socket-io-services/socket.io.service';
import { HomePageService } from '../../../home-page/homepage.service';

@Component({
  selector: 'app-article-publish',
  templateUrl: './article-publish.component.html',
  styleUrls: ['./article-publish.component.css'],
})
export class ArticlePublishComponent
  extends BaseController
  implements OnInit, OnDestroy
{
  constructor(
    private readonly router: Router,
    private readonly nexLearningService: NexLearningService,
    private readonly keycloakService: KeycloakService,
    private readonly webSocket: SocketService,
    private readonly homepageService: HomePageService
  ) {
    super(ArticlePublishComponent.name);
  }

  //Summernote Config
  public config: any = {
    airMode: false,
    tabDisable: true,
    popover: {
      table: [
        ['add', ['addRowDown', 'addRowUp', 'addColLeft', 'addColRight']],
        ['delete', ['deleteRow', 'deleteCol', 'deleteTable']],
      ],
      image: [
        ['image', ['resizeFull', 'resizeHalf', 'resizeQuarter', 'resizeNone']],
        ['float', ['floatLeft', 'floatRight', 'floatNone']],
        ['remove', ['removeMedia']],
      ],
      link: [['link', ['linkDialogShow', 'unlink']]],
      air: [
        [
          'font',
          [
            'bold',
            'italic',
            'underline',
            'strikethrough',
            'superscript',
            'subscript',
            'clear',
          ],
        ],
      ],
    },
    height: '200px',
    uploadImagePath: '/api/upload',
    toolbar: [
      ['misc', ['codeview', 'undo', 'redo', 'codeBlock']],
      [
        'font',
        [
          'bold',
          'italic',
          'underline',
          'strikethrough',
          'superscript',
          'subscript',
          'clear',
        ],
      ],
      ['fontsize', ['fontname', 'fontsize', 'color']],
      ['para', ['style0', 'ul', 'ol', 'paragraph', 'height']],
      ['insert', ['table', 'picture', 'link', 'video', 'hr']],
      ['customButtons', ['testBtn']],
      ['view', ['fullscreen', 'codeview', 'help']],
    ],
    fontSizes: [
      '8',
      '9',
      '10',
      '11',
      '12',
      '14',
      '18',
      '24',
      '36',
      '44',
      '56',
      '64',
      '76',
      '84',
      '96',
    ],
    fontNames: [
      'Arial',
      'Times New Roman',
      'Inter',
      'Comic Sans MS',
      'Courier New',
      'Roboto',
      'Times',
      'MangCau',
      'BayBuomHep',
      'BaiSau',
      'BaiHoc',
      'CoDien',
      'BucThu',
      'KeChuyen',
      'MayChu',
      'ThoiDai',
      'ThuPhap-Ivy',
      'ThuPhap-ThienAn',
    ],
    codeviewFilter: true,
    codeviewFilterRegex:
      /<\/*(?:applet|b(?:ase|gsound|link)|embed|frame(?:set)?|ilayer|l(?:ayer|ink)|meta|object|s(?:cript|tyle)|t(?:itle|extarea)|xml|.*onmouseover)[^>]*?>/gi,
    codeviewIframeFilter: true,
  };
  //Summernote Config

  faSearch = faSearch;
  faNewspaper = faNewspaper;
  faChevronRight = faChevronRight;
  faBookBookmark = faBookBookmark;
  faBookOpen = faBookOpen;
  faRefresh = faRefresh;
  faComment = faCommentDots;

  title!: string;
  image!: File;
  imageShow: string =
    '../../../../../../assets/image/article/article-dummy.png';
  categoryArticle: ArticleCategoryDTO[] = [];
  content!: string;
  category!: number;

  //Image Validation
  imageValidator!: boolean;
  imageValidatorMessage!: string;

  //Form Config
  mform: FormGroup = new FormGroup({
    title: new FormControl(this.title, [Validators.required]),
    image: new FormControl(this.image, [Validators.required]),
    content: new FormControl(this.content, [Validators.required]),
    category: new FormControl(this.category, [Validators.required]),
  });

  ngOnInit(): void {
    initTE({ Select });
    this.getCategoryArticle();
  }

  //Get Article Category
  async getCategoryArticle(): Promise<void> {
    try {
      this.nexLearningService
        .getCategoryArticle(null, null, null, 'true')
        .subscribe((data) => {
          this.categoryArticle = data.data.result;
        });
    } catch (error) {
      throw error;
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    this.image = file;
    this.imageValidation(this.image, 1).then((data) => {
      this.imageValidator = data.status;
      this.imageValidatorMessage = data.message;
    });
    if (file) {
      this.image = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imageShow = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  //Send data article
  async createArticleData(): Promise<void> {
    try {
      if (this.mform.valid && this.imageValidator) {
        this.nexLearningService
          .getUser(this.keycloakService.getUsername())
          .subscribe((data) => {
            const socket: NotificationRequestDTO = {
              senderPersonalNumber:  this.keycloakService.getUsername(),
              receiverPersonalNumber: '782659',
              title: 'Create Article',
              description: 'Article Request To Created',
              isRead: 'false',
              contentType: 'article',
              contentUuid: 'test'
            }
            this.webSocket.sendSocket(socket).subscribe()
            this.homepageService.createNotification(socket).subscribe()
            const dto: ArticlePublishDTO = {
              image: this.image,
              personalNumber: this.keycloakService.getUsername(),
              articleCategoryId:
                this.mform.get('category')?.value != null
                  ? this.mform.get('category')?.value
                  : null,
              title:
                this.mform.get('title')?.value != null
                  ? this.mform.get('title')?.value
                  : null,
              content:
                this.mform.get('content')?.value != null
                  ? this.mform.get('content')?.value
                  : null,
              uploadBy: data.personalName,
              unit: data.personalUnit,
            };
            this.nexLearningService.createArticle(dto).subscribe(() => {
              Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Your article was successfully created.',
                timer: 1000,
                showConfirmButton: false,
              }).then(() => {
                this.router.navigate(['/user/nex-learning/article']);
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

  cancel(): void {
    this.router.navigate(['/user/nex-learning/article']);
  }

  ngOnDestroy(): void {}
}
