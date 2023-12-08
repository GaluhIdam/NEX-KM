import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { KeycloakService } from 'keycloak-angular';
import { environment } from 'src/environments/environment.prod';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import { NexLevelService } from 'src/app/pages/user/nex-level/nex-level.service';
import {
  PointConfigCreateDTO,
  PointConfigDTO,
} from 'src/app/pages/user/nex-level/dtos/point-config.dto';
import { EMPTY, Observable, Subject, Subscription, catchError, debounceTime, filter, switchMap, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';
import { Modal, Ripple, Select, initTE } from 'tw-elements';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css'],
})
export class ConfigComponent
  extends BaseController
  implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private readonly nexlevelservice: NexLevelService,
    private readonly keycloackService: KeycloakService
  ) {
    super(ConfigComponent.name);
    this.initTitle();
  }

  private readonly unsubscribe$ = new Subject();
  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  // Font Awesome
  faArrowRight = faArrowRight;
  faBell = faBell;
  faGear = faGear;
  faSearch = faSearch;
  faFilter = faFilter;
  faPrint = faPrint;
  faEye = faEye;
  faStar = faStar;
  faBan = faBan;
  faXmark = faXmark;
  faPencil = faPencil;
  faPlus = faPlus;
  faTrash = faTrash;
  faBookmark = faBookmark;
  faCircleCheck = faCircleCheck;
  faCircleChevronLeft = faCircleChevronLeft;
  faCircleChevronRight = faCircleChevronRight;
  faSadTear = faSadTear;
  faListCheck = faListCheck;

  // insisalisasi
  title: any;
  obs!: Subscription;
  id!: number | null;
  uuid!: string | null;
  addOredit!: boolean;
  pointData: PointConfigDTO[] = [];

  // paginator
  page: number = 1;
  limit: number = 10;
  search: string = '';
  sortBy: string = 'trending';
  optionx: string = 'false';
  totalData: number = 0;
  pageData: Array<number> = [];
  descStatus: string | null = null;

  mform: FormGroup = new FormGroup({
    search: new FormControl(''),
    page: new FormControl(this.page),
    limit: new FormControl(this.limit),
  });

  submitForm: FormGroup = new FormGroup({
    activity: new FormControl('', [Validators.required]),
    slug: new FormControl('', [Validators.required]),
    point: new FormControl('', [Validators.required]),
    status: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    initTE({ Modal, Ripple, Select });
    this.getDataPointConfig(this.page, this.limit, this.search, this.sortBy);
    this.obs = this.mform.valueChanges
      .pipe(debounceTime(500))
      .subscribe((data) => {
        if (data.page < 1) {
          data.page < 1 ? this.mform.get('page')?.setValue(1) : data.page;
        } else {
          this.getDataPointConfig(
            data.page,
            data.limit,
            data.search,
            data.sortBy
          );
        }
      });
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

  // getDataPoint
  getDataPointConfig(
    page: number,
    limit: number,
    search: string,
    sortBy: string
  ): void {
    this.nexlevelservice
      .getPointConfig(
        page, limit, search, sortBy
      )
      .pipe(
        catchError((err) => {
          console.error(err);
          err('error', err);
          return EMPTY;
        }),
        switchMap((response) => {
          this.pointData = response.data.result;
          this.totalData = response.data.total;
          this.paginate(this.totalData, this.limit, this.pageData);
          return Observable.create();
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe();
  }

  // getByUuid
  getByUuid(uuid: string): void {
    this.nexlevelservice.getPointConfigByUuid(uuid)
      .pipe(
        catchError((err) => {
          console.error(err);
          err('error', err);
          return EMPTY;
        }),
        switchMap((response) => {
          this.submitForm.get('activity')?.setValue(response.data.activity);
          this.submitForm.get('slug')?.setValue(response.data.slug);
          this.submitForm.get('point')?.setValue(response.data.point);
          this.submitForm.get('status')?.setValue(response.data.status);
          return Observable.create()
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe()
  }

  postCategory(): void {
    try {
      if (this.submitForm.valid) {
        const dto: PointConfigCreateDTO = {
          activity: this.submitForm.get('activity')?.value,
          slug: this.submitForm.get('slug')?.value,
          point: Number(this.submitForm.get('point')?.value),
          status:
            this.submitForm.get('status')?.value === 'false' ? false : true,
        };
        this.nexlevelservice.createPointConfig(dto).subscribe(() => {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Your point config was successfully created.',
            timer: 1000,
            showConfirmButton: false,
          }).then(() => {
            this.getDataPointConfig(
              this.page,
              this.limit,
              this.search,
              this.sortBy
            );
            this.submitForm.reset();
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
          Object.keys(this.submitForm.controls).forEach((key) => {
            const control = this.submitForm.get(key);
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

  async updateDataCategory(): Promise<void> {
    try {
      if (this.submitForm.valid) {
        const dto: PointConfigCreateDTO = {
          activity: this.submitForm.get('activity')?.value,
          slug: this.submitForm.get('slug')?.value,
          point: Number(this.submitForm.get('point')?.value),
          status:
            this.submitForm.get('status')?.value === 'false' ? false : true,
        };
        this.nexlevelservice
          .updatePointConfig(this.uuid!, dto)
          .subscribe(() => {
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Your point config was successfully updated.',
              timer: 1000,
              showConfirmButton: false,
            }).then(() => {
              this.getDataPointConfig(
                this.page,
                this.limit,
                this.search,
                this.sortBy
              );
              this.submitForm.reset();
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
          Object.keys(this.submitForm.controls).forEach((key) => {
            const control = this.submitForm.get(key);
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

  async deletePointData(uuid: string): Promise<void> {
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
          this.nexlevelservice.deletePointConfig(uuid).subscribe(() => {
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Your point config was successfully deleted.',
              timer: 1000,
              showConfirmButton: false,
            }).then(() => {
              this.getDataPointConfig(
                this.page,
                this.limit,
                this.search,
                this.sortBy
              );
            });
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
    this.submitForm.reset();
  }

  callModal(
    title: string | null,
    id: number | null,
    uuid: string | null,
    addOredit: boolean
  ): void {
    this.submitForm.reset();
    if (uuid) {
      this.id = id;
      this.uuid = uuid;
      this.getByUuid(uuid);
    }
    this.addOredit = addOredit;
  }

  ngOnDestroy(): void {
    this._onDestroy$.next(true)
    this._onDestroy$.unsubscribe
  }

}
