import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import { ArticleCategoryComponent } from '../../nex-learning/article-category/article-category.component';
import { Subscription, debounceTime, filter } from 'rxjs';
import { Modal, Ripple, initTE } from 'tw-elements';
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
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ArticleCategoryDTO } from 'src/app/pages/user/nex-learning/dtos/article-category.dto';
import { NexCommunityService } from 'src/app/pages/user/nex-community/nex-community.service';
import {
  CreateRoleCommunityDTO,
  RoleCommunityDTO,
} from 'src/app/pages/user/nex-community/dto/community.dto';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-community-role',
  templateUrl: './community-role.component.html',
  styleUrls: ['./community-role.component.css'],
})
export class CommunityRoleComponent
  extends BaseController
  implements OnInit, OnDestroy
{
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private readonly nexcommunityService: NexCommunityService,
    private readonly keycloakService: KeycloakService
  ) {
    super(ArticleCategoryComponent.name);
    this.initTitle();
  }

  obs!: Subscription;

  id!: number | null;
  uuid!: string | null;
  addOredit!: boolean;

  title: any;
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

  categoryData!: Array<RoleCommunityDTO>;

  page: number = 1;
  limit: number = 10;
  search: string = '';
  totalData: number = 0;
  sortBy: string = 'desc';
  pageData: Array<number> = [];

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
    this.getDataRole(this.page, this.limit, this.search, this.sortBy);
    this.obs = this.mform.valueChanges
      .pipe(debounceTime(500))
      .subscribe((data) => {
        if (data.page < 1) {
          data.page < 1 ? this.mform.get('page')?.setValue(1) : data.page;
        } else {
          this.getDataRole(data.page, data.limit, data.search, this.sortBy);
        }
      });
  }
  ngOnDestroy(): void {}

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

  async getDataRole(
    page: number,
    limit: number,
    search: string,
    sortBy: string
  ): Promise<void> {
    this.nexcommunityService
      .getRoleByPage(page, limit, search, sortBy)
      .subscribe((response) => {
        this.categoryData = response.data.result;
        this.totalData = response.data.total;
      });
  }

  async createDataRole(): Promise<void> {
    try {
      if (this.submitForm.valid) {
        const dto: CreateRoleCommunityDTO = {
          name: this.submitForm.get('title')?.value,
        };
        this.nexcommunityService.createRoleCommunity(dto).subscribe(() => {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Your role was successfully created.',
            timer: 1000,
            showConfirmButton: false,
          }).then(() => {
            this.submitForm.get('title')?.reset();
            this.getDataRole(this.page, this.limit, this.search, this.sortBy);
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

  async updateDataRole(): Promise<void> {
    try {
      if (this.submitForm.valid) {
        const dto: RoleCommunityDTO = {
          id: 0,
          uuid: this.uuid!,
          name: this.submitForm.get('title')?.value,
        };
        this.nexcommunityService
          .updateRoleCommunity(this.uuid!, dto)
          .subscribe(() => {
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Your role was successfully updated.',
              timer: 1000,
              showConfirmButton: false,
            }).then(() => {
              this.submitForm.get('title')?.reset();
              this.getDataRole(this.page, this.limit, this.search, this.sortBy);
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
}
