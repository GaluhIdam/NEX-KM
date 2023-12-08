import { Component, OnDestroy, OnInit } from '@angular/core';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import {
  faArrowRight,
  faBookBookmark,
  faBookOpen,
  faChevronRight,
  faCommentDots,
  faNewspaper,
  faRefresh,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ArticleCategoryDTO } from '../../dtos/article-category.dto';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NexLearningService } from '../../nex-learning.service';
import { KeycloakService } from 'keycloak-angular';
import { SummernoteOptions } from 'ngx-summernote/lib/summernote-options';
import { Select, initTE } from 'tw-elements';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import { ArticlePublishDTO } from '../../dtos/articles.dto';
import Swal from 'sweetalert2';

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
    private readonly keycloakService: KeycloakService
  ) {
    super(ArticleEditComponent.name);
  }

  faSearch = faSearch;
  faArrowRight = faArrowRight;
  faBookBookmark = faBookBookmark;
  faBookOpen = faBookOpen;
  faComment = faCommentDots;
  faChevronRight = faChevronRight;
  faNewspaper = faNewspaper;
  faRefresh = faRefresh;

  uuid!: string;
  title!: string;
  image!: File;
  imageShow!: string;
  categoryArticle: ArticleCategoryDTO[] = [];
  content!: string;
  category!: number;

  //Image Validation
  imageValidator: boolean | null = null;
  imageValidatorMessage!: string;

  //Form Config
  mform: FormGroup = new FormGroup({
    title: new FormControl(this.title, [Validators.required]),
    image: new FormControl(this.image),
    content: new FormControl(this.content, [Validators.required]),
    category: new FormControl(this.category, [Validators.required]),
  });

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

  ngOnInit(): void {
    initTE({ Select });
    this.activeRoute.params.subscribe((params: Params) => {
      const uuid = params['uuid'];
      this.uuid = params['uuid'];
      this.getArticleById(uuid);
    });
    this.getCategoryArticle();
  }

  ngOnDestroy(): void {}

  //Get Article By Id
  async getArticleById(uuid: string): Promise<void> {
    try {
      this.nexLearningService.getArticleDataId(uuid).subscribe(async (data) => {
        this.imageShow =
          environment.httpUrl +
          '/v1/api/file-manager/get-imagepdf/' +
          data.data.path;
        this.nexLearningService
          .getImageFromUrl(this.imageShow)
          .subscribe((file) => {
            this.image = file;
          });
        this.mform.get('title')?.setValue(data.data.title);
        this.mform.get('category')?.setValue(data.data.articleCategory!.id);
        this.mform.get('content')?.setValue(data.data.content);
      });
    } catch (error) {
      throw error;
    }
  }

  //Update Article
  async updateArticleById(uuid: string): Promise<void> {
    try {
      if (
        this.mform.valid &&
        (this.imageValidator == null || this.imageValidator == true)
      ) {
        this.nexLearningService
          .getUser(this.keycloakService.getUsername())
          .subscribe((data) => {
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
            this.nexLearningService.updateArticle(uuid, dto).subscribe(() => {
              Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Your article was successfully created.',
                timer: 1000,
                showConfirmButton: false,
              }).then(() => {
                this.router.navigate([`/user/nex-learning/article/${uuid}`]);
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
        });
        Object.keys(this.mform.controls).forEach((key) => {
          const control = this.mform.get(key);
          if (control?.invalid) {
            control.markAsTouched();
          }
        });
      }
    } catch (error) {
      throw error;
    }
  }

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
  cancel(): void {
    this.router.navigate(['/user/nex-learning/article']);
  }
}
