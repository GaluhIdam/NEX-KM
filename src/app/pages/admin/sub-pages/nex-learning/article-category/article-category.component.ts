import { Component, OnInit, OnDestroy } from '@angular/core';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import {
  faArrowRight,
  faBell,
  faGear,
  faSearch,
  faFilter,
  faPrint,
  faCircleCheck,
  faEye,
  faStar,
  faBan,
  faXmark,
  faPencil,
  faPlus,
  faTrash,
  faBookmark,
  faCircleChevronLeft,
  faCircleChevronRight,
  faSadTear,
  faListCheck,
} from '@fortawesome/free-solid-svg-icons';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { NexLearningService } from 'src/app/pages/user/nex-learning/nex-learning.service';
import { Subscription, debounceTime, filter } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  ArticleCategoryDTO,
  CreateArticleCategoryDTO,
} from 'src/app/pages/user/nex-learning/dtos/article-category.dto';
import { Modal, Ripple, initTE } from 'tw-elements';
import { KeycloakService } from 'keycloak-angular';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-article-category',
  templateUrl: './article-category.component.html',
  styleUrls: ['./article-category.component.css'],
})
export class ArticleCategoryComponent
  extends BaseController
  implements OnInit, OnDestroy
{
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private readonly nexlearningService: NexLearningService,
    private readonly keycloakService: KeycloakService
  ) {
    super(ArticleCategoryComponent.name);
    this.initTitle();
  }

  title: any;

  obs!: Subscription;

  id!: number | null;
  uuid!: string | null;
  addOredit!: boolean;

  faArrowRight = faArrowRight;
  faBell = faBell;
  faGear = faGear;
  faSearch = faSearch;
  faFilter = faFilter;
  faPrint = faPrint;
  faCircleCheck = faCircleCheck;
  faEye = faEye;
  faStar = faStar;
  faBan = faBan;
  faXmark = faXmark;
  faPencil = faPencil;
  faPlus = faPlus;
  faTrash = faTrash;
  faBookmark = faBookmark;
  faCircleChevronLeft = faCircleChevronLeft;
  faCircleChevronRight = faCircleChevronRight;
  faSadTear = faSadTear;
  faListCheck = faListCheck;

  page: number = 1;
  limit: number = 10;
  search: string = '';
  sortBy: string = 'trending';
  optionx: string = 'false';
  totalData: number = 0;
  pageData: Array<number> = [];
  descStatus: string | null = null;

  categoryData!: Array<ArticleCategoryDTO>;

  mform: FormGroup = new FormGroup({
    search: new FormControl(''),
    page: new FormControl(this.page),
    limit: new FormControl(this.limit),
  });

  submitForm: FormGroup = new FormGroup({
    title: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    initTE({ Modal, Ripple });
    this.getCategoryData(this.page, this.limit, this.search, this.optionx);
    this.obs = this.mform.valueChanges
      .pipe(debounceTime(500))
      .subscribe((data) => {
        if (data.page < 1) {
          data.page < 1 ? this.mform.get('page')?.setValue(1) : data.page;
        } else {
          this.getCategoryData(
            data.page,
            data.limit,
            data.search,
            this.optionx
          );
        }
      });
  }
  ngOnDestroy(): void {
    this.obs.unsubscribe();
  }

  initTitle(): void {
    this.activatedRoute.data.subscribe((data) => {
      this.title = data;
    });
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        var rt = this.getChild(this.activatedRoute);

        rt.data.subscribe((data: { title: string }) => {
          this.titleService.setTitle('Nex ' + data.title);
        });
      });
  }
  getChild(activatedRoute: ActivatedRoute): any {
    if (activatedRoute.firstChild) {
      return this.getChild(activatedRoute.firstChild);
    } else {
      return activatedRoute;
    }
  }

  //Get Category
  async getCategoryData(
    page: number,
    limit: number,
    search: string,
    optionx: string
  ): Promise<void> {
    try {
      this.nexlearningService
        .getCategoryArticle(page, limit, search, optionx)
        .subscribe((response) => {
          this.categoryData = response.data.result;
          this.totalData = response.data.total;
          this.paginate(this.totalData, this.limit, this.pageData);
        });
    } catch (error) {
      throw error;
    }
  }

  //Create Category
  async postCategory(): Promise<void> {
    try {
      if (this.submitForm.valid) {
        const dto: CreateArticleCategoryDTO = {
          title: this.submitForm.get('title')?.value,
          status: false,
          personalNumber: this.keycloakService.getUsername(),
        };
        this.nexlearningService.createCategoryArticle(dto).subscribe(() => {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Your article category was successfully created.',
            timer: 1000,
            showConfirmButton: false,
          }).then(() => {
            this.submitForm.get('title')?.reset();
            this.getCategoryData(
              this.page,
              this.limit,
              this.search,
              this.optionx
            );
          });
        });
      } else {
        Object.keys(this.submitForm.controls).forEach((key) => {
          const control = this.submitForm.get(key);
          if (control?.invalid) {
            control.markAsTouched();
          }
        });
        Swal.fire({
          icon: 'error',
          title: 'Failed!',
          text: 'Please check your data before submit.',
          timer: 1000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      throw error;
    }
  }

  //Update Category
  async updateDataCategory(): Promise<void> {
    try {
      if (this.submitForm.valid) {
        const dto: ArticleCategoryDTO = {
          id: this.id!,
          uuid: this.uuid!,
          title: this.submitForm.get('title')?.value,
          status: false,
          personalNumber: this.keycloakService.getUsername(),
        };
        this.nexlearningService
          .updateCetagoryArticle(this.uuid!, dto)
          .subscribe(() => {
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Your article category was successfully created.',
              timer: 1000,
              showConfirmButton: false,
            }).then(() => {
              this.submitForm.get('title')?.reset();
              this.getCategoryData(
                this.page,
                this.limit,
                this.search,
                this.optionx
              );
            });
          });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed!',
          text: 'Please check your data before submit.',
          timer: 1000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      throw error;
    }
  }

  //active or deactive
  async activeOrDeactive(uuid: string, status: boolean): Promise<void> {
    try {
      const dto: ArticleCategoryDTO = {
        id: this.id!,
        uuid: this.uuid!,
        title: this.submitForm.get('title')?.value,
        status: status == true ? false : true,
        personalNumber: this.keycloakService.getUsername(),
      };
      this.nexlearningService
        .activeDeactiveCategoryArticle(uuid, dto)
        .subscribe(() => {
          if (dto.status) {
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Your article category was actived.',
              timer: 1000,
              showConfirmButton: false,
            }).then(() => {
              this.submitForm.get('title')?.reset();
              this.getCategoryData(
                this.page,
                this.limit,
                this.search,
                this.optionx
              );
            });
          } else {
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Your article category was deactived.',
              timer: 1000,
              showConfirmButton: false,
            }).then(() => {
              this.submitForm.get('title')?.reset();
              this.getCategoryData(
                this.page,
                this.limit,
                this.search,
                this.optionx
              );
            });
          }
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

  reset(): void {
    this.submitForm.get('title')?.reset();
  }

  callModal(
    title: string | null,
    id: number | null,
    uuid: string | null,
    addOredit: boolean
  ): void {
    this.submitForm.get('title')?.reset();
    this.submitForm.get('title')?.setValue(title);
    this.id = id;
    this.uuid = uuid;
    this.addOredit = addOredit;
  }
}
