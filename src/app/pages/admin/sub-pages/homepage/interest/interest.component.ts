import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { Subscription, debounceTime, filter } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { Title } from '@angular/platform-browser';
import { ArticleCategoryDTO } from 'src/app/pages/user/nex-learning/dtos/article-category.dto';
import { HomePageService } from 'src/app/pages/user/home-page/homepage.service';
import {
  InterestSkillCreateDTO,
  InterestSkillDTO,
} from 'src/app/pages/user/home-page/dtos/interest-skill.dto';
import Swal from 'sweetalert2';
import { Modal, Ripple, initTE } from 'tw-elements';

@Component({
  selector: 'app-interest',
  templateUrl: './interest.component.html',
  styleUrls: ['./interest.component.css'],
})
export class InterestComponent
  extends BaseController
  implements OnInit, OnDestroy
{
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private readonly hompageService: HomePageService,
    private readonly keycloakService: KeycloakService
  ) {
    super(InterestComponent.name);
    this.initTitle();
  }

  title: any;

  obs!: Subscription;

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

  interestData!: Array<InterestSkillDTO>;

  page: number = 1;
  limit: number = 10;
  search: string = '';
  sortBy: string = 'desc';
  totalData: number = 0;
  pageData: Array<number> = [];
  descStatus: string | null = null;

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
    this.getDataInterest(this.page, this.limit, this.search, this.sortBy);
    this.obs = this.mform.valueChanges
      .pipe(debounceTime(500))
      .subscribe((data) => {
        if (data.page < 1) {
          data.page < 1 ? this.mform.get('page')?.setValue(1) : data.page;
        } else {
          this.getDataInterest(data.page, data.limit, data.search, this.sortBy);
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
    uuid: string | null,
    addOredit: boolean
  ): void {
    this.submitForm.get('title')?.reset();
    this.submitForm.get('title')?.setValue(title);
    this.uuid = uuid;
    this.addOredit = addOredit;
  }

  //Get Interest Data
  async getDataInterest(
    page: number,
    limit: number,
    search: string,
    sortBy: string
  ): Promise<void> {
    try {
      this.hompageService
        .getInterest(page, limit, search, sortBy)
        .subscribe((response) => {
          this.interestData = response.data.result;
          this.totalData = response.data.total;
          this.paginate(this.totalData, this.limit, this.pageData);
        });
    } catch (error) {
      throw error;
    }
  }

  //Create Interest
  async createDataInterest(): Promise<void> {
    try {
      if (this.submitForm.valid) {
        const dto: InterestSkillCreateDTO = {
          name: this.submitForm.get('title')?.value,
        };
        this.hompageService.createInterest(dto).subscribe(() =>
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Interest was successfully created.',
            timer: 1000,
            showConfirmButton: false,
          }).then(() => {
            this.submitForm.get('title')?.reset();
            this.getDataInterest(
              this.page,
              this.limit,
              this.search,
              this.sortBy
            );
          })
        );
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

  //Update Interest
  async updateDataInterest(): Promise<void> {
    try {
      if (this.submitForm.valid) {
        const dto: InterestSkillCreateDTO = {
          name: this.submitForm.get('title')?.value,
        };
        this.hompageService.updateInterest(this.uuid!, dto).subscribe(() =>
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Interest was successfully updated.',
            timer: 1000,
            showConfirmButton: false,
          }).then(() => {
            this.submitForm.get('title')?.reset();
            this.getDataInterest(
              this.page,
              this.limit,
              this.search,
              this.sortBy
            );
          })
        );
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

  async deleteDataInterest(uuid: string): Promise<void> {
    try {
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
          this.hompageService.deleteInterest(uuid).subscribe(() =>
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Interest was successfully deleted.',
              timer: 1000,
              showConfirmButton: false,
            }).then(() => {
              this.submitForm.get('title')?.reset();
              this.getDataInterest(
                this.page,
                this.limit,
                this.search,
                this.sortBy
              );
            })
          );
        }
      });
    } catch (error) {
      throw error;
    }
  }
}
