import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { faCheckCircle, faXmark } from '@fortawesome/free-solid-svg-icons';
import { KeycloakService } from 'keycloak-angular';
import { SummernoteOptions } from 'ngx-summernote/lib/summernote-options';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import { ArticleCategoryDTO } from 'src/app/pages/user/nex-learning/dtos/article-category.dto';
import {
  ArticlePublishDTO,
  ArticlesDTO,
} from 'src/app/pages/user/nex-learning/dtos/articles.dto';
import { StatusDTO } from 'src/app/pages/user/nex-learning/dtos/status.dto';
import { NexLearningService } from 'src/app/pages/user/nex-learning/nex-learning.service';
import { Ripple, Select, initTE } from 'tw-elements';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment.prod';
import { SocketService } from 'src/app/core/utility/socket-io-services/socket.io.service';
import { HomePageService } from 'src/app/pages/user/home-page/homepage.service';
import { NotificationRequestDTO } from 'src/app/pages/user/home-page/dtos/notification.dto';

@Component({
  selector: 'app-article-edit',
  templateUrl: './article-edit.component.html',
  styleUrls: ['./article-edit.component.css'],
})
export class ArticleEditComponent
  extends BaseController
  implements OnInit, OnDestroy
{
  constructor(
    private readonly router: Router,
    private readonly activeRoute: ActivatedRoute,
    private readonly nexLearningService: NexLearningService,
    private readonly keycloakService: KeycloakService,
    private readonly webSocket: SocketService,
    private readonly homepageService: HomePageService
  ) {
    super(ArticleEditComponent.name);
  }

  ngOnInit(): void {
    this.getUserData();
    initTE({ Select, Ripple });
    this.activeRoute.params.subscribe((params: Params) => {
      const uuid = params['uuid'];
      this.uuid = uuid;
      this.getArticleId(uuid);
    });
    this.getCategoryArticle();
  }
  ngOnDestroy(): void {}

  //Summernote Config
  config: SummernoteOptions = {
    placeholder: 'type your content',
    tabsize: 2,
    height: 500,
    uploadImagePath: '/api/upload',
    toolbar: [
      ['misc', ['codeview', 'undo', 'redo']],
      ['style', ['bold', 'italic', 'underline', 'clear']],
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
      ['para', ['style', 'ul', 'ol', 'paragraph', 'height']],
      ['insert', ['link', 'hr']],
    ],
    fontNames: [
      'Helvetica',
      'Arial',
      'Arial Black',
      'Comic Sans MS',
      'Courier New',
      'Roboto',
      'Times',
    ],
  };
  //Summernote Config

  //Option Status
  statusEditorChoice: Array<StatusDTO> = [
    {
      name: 'No',
      status: false,
    },
    {
      name: 'Yes',
      status: true,
    },
  ];
  categoryStoryList: Array<string> = ['Inspirational', 'Retirement'];
  statusApproveList: Array<StatusDTO> = [
    {
      name: 'Waiting Approval',
      status: null,
    },
    {
      name: 'Reject',
      status: false,
    },
    {
      name: 'Approve',
      status: true,
    },
  ];
  favoriteList: Array<StatusDTO> = [
    {
      name: 'No',
      status: false,
    },
    {
      name: 'Yes',
      status: true,
    },
  ];

  //Image Validation
  imageValidator: boolean = true;
  imageValidatorMessage!: string;

  faXmark = faXmark;
  faCheckCircle = faCheckCircle;
  articleData: ArticlesDTO<ArticleCategoryDTO> = {
    id: 0,
    uuid: '',
    articleCategory: null,
    personalNumber: null,
    title: null,
    content: null,
    image: null,
    path: null,
    score: null,
    uploadBy: null,
    unit: null,
    approvalStatus: null,
    approvalDesc: null,
    approvalBy: null,
    editorChoice: null,
    bannedStatus: null,
    updatedAt: null,
    _count: {
      articleComment: 0,
    },
  };

  personalName!: string;
  categoryArticle: ArticleCategoryDTO[] = [];
  uuid!: string;
  image!: File;
  imageShow!: string;

  mform: FormGroup = new FormGroup({
    title: new FormControl(this.articleData.title, [Validators.required]),
    category: new FormControl(this.articleData.articleCategory?.id, [
      Validators.required,
    ]),
    image: new FormControl(this.articleData.image),
    content: new FormControl(this.articleData.content, [Validators.required]),
    dateCreated: new FormControl(this.articleData.updatedAt, [
      Validators.required,
    ]),
    createdBy: new FormControl(this.articleData.personalNumber, [
      Validators.required,
    ]),
    personalNumber: new FormControl(this.articleData.personalNumber, [
      Validators.required,
    ]),
    unit: new FormControl(this.articleData.unit, [Validators.required]),
    editorChoice: new FormControl(this.articleData.editorChoice, [
      Validators.required,
    ]),
    favorite: new FormControl(this.favoriteList[0].status, [
      Validators.required,
    ]),
    statusApprove: new FormControl(this.articleData.approvalStatus),
    approvalBy: new FormControl(this.articleData.approvalBy, [
      Validators.required,
    ]),
    description: new FormControl(this.articleData.approvalDesc),
  });

  //Get Article Category
  async getCategoryArticle(): Promise<void> {
    try {
      this.nexLearningService
        .getCategoryArticle(null, null, null, 'true')
        .subscribe((data) => {
          const dataTemp: ArticleCategoryDTO[] = [];
          data.data.result.forEach((dto) => {
            const dtx: ArticleCategoryDTO = {
              id: dto.id,
              title: dto.title,
              status: dto.status,
              personalNumber: dto.personalNumber,
              uuid: dto.uuid,
            };
            dataTemp.unshift(dtx);
          });
          this.categoryArticle = this.categoryArticle.concat(dataTemp);
        });
    } catch (error) {
      throw error;
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    this.imageValidation(file, 1).then((data) => {
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

  async getUserData(): Promise<void> {
    this.nexLearningService
      .getUser(this.keycloakService.getUsername())
      .subscribe((data) => {
        this.personalName = data.personalName;
        this.mform.get('approvalBy')?.disable();
        this.mform.get('createdBy')?.disable();
        this.mform.get('favorite')?.disable();
        this.mform.get('unit')?.disable();
        this.mform.get('dateCreated')?.disable();
        this.mform.get('description')?.disable();
        this.mform.get('editorChoice')?.disable();
        this.mform.get('statusApprove')?.disable();
      });
  }

  async getArticleId(uuid: string): Promise<void> {
    this.nexLearningService
      .getArticleDataId(uuid)
      .subscribe(async (article) => {
        this.imageShow =
          environment.httpUrl +
          '/v1/api/file-manager/get-imagepdf/' +
          article.data.path;
        this.nexLearningService
          .getImageFromUrl(this.imageShow)
          .subscribe((file) => {
            this.image = file;
          });
        this.mform.get('title')?.setValue(article.data.title);
        this.mform.get('category')?.setValue(article.data.articleCategory?.id);
        this.mform.get('content')?.setValue(article.data.content);
        this.mform
          .get('dateCreated')
          ?.setValue(article.data.updatedAt?.toString().slice(0, 10));
        this.mform.get('unit')?.setValue(article.data.unit);
        this.mform.get('personalNumber')?.setValue(article.data.personalNumber);
        if (article.data.personalNumber) {
          this.nexLearningService
            .getUser(article.data.personalNumber!.toString())
            .subscribe((data) => {
              this.mform.get('createdBy')?.setValue(data.personalName);
            });
        }
        this.mform.get('approvalBy')?.setValue(article.data.approvalBy);
        this.mform.get('editorChoice')?.setValue(article.data.editorChoice);
        this.mform.get('statusApprove')?.setValue(article.data.approvalStatus);
        this.mform.get('description')?.setValue(article.data.approvalDesc);
        this.articleData.path =
          environment.httpUrl +
          '/v1/api/file-manager/get-imagepdf/' +
          article.data.path;
      });
  }

  async updateArticle(): Promise<void> {
    if (
      this.mform.valid &&
      (this.imageValidator == null || this.imageValidator == true)
    ) {
      const dto: ArticlePublishDTO = {
        image: this.image,
        personalNumber: this.mform.get('personalNumber')?.value,
        articleCategoryId: this.mform.get('category')?.value,
        title: this.mform.get('title')?.value,
        content: this.mform.get('content')?.value,
        unit: this.mform.get('unit')?.value,
        uploadBy: this.mform.get('createdBy')?.value,
      };
      this.nexLearningService.updateArticle(this.uuid, dto).subscribe(() => {
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Article was successfully updated.',
          timer: 1000,
          showConfirmButton: false,
        }).then(() => {
          this.router.navigate(['/admin/article']);
        });
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Please check your data before submit.',
        timer: 1000,
        showConfirmButton: false,
      });
      Object.keys(this.mform.controls).forEach((key) => {
        const control = this.mform.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
}
