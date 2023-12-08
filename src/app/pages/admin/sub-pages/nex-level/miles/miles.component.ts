import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
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
import { KeycloakService } from 'keycloak-angular';
import { invalid } from 'moment';
import { EMPTY, Observable, Subject, Subscription, catchError, debounceTime, filter, switchMap, takeUntil, tap } from 'rxjs';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import { SocketService } from 'src/app/core/utility/socket-io-services/socket.io.service';
import { NotificationRequestDTO } from 'src/app/pages/user/home-page/dtos/notification.dto';
import { HomePageService } from 'src/app/pages/user/home-page/homepage.service';
import { NexLearningService } from 'src/app/pages/user/nex-learning/nex-learning.service';
import {
  MileCreateDTO,
  MileDTO,
} from 'src/app/pages/user/nex-level/dtos/mile.dto';
import { NexLevelService } from 'src/app/pages/user/nex-level/nex-level.service';
import { environment } from 'src/environments/environment.prod';
import Swal from 'sweetalert2';
import { Modal, Ripple, Select, initTE } from 'tw-elements';

@Component({
  selector: 'app-miles',
  templateUrl: './miles.component.html',
  styleUrls: ['./miles.component.css'],
})
export class MilesComponent
  extends BaseController
  implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private readonly nexlearningService: NexLearningService,
    private readonly nexlevelservice: NexLevelService,
    private readonly keycloackService: KeycloakService,
    private fb: FormBuilder,
    private readonly webSocket: SocketService,
    private readonly homepageService: HomePageService,
  ) {
    super(MilesComponent.name);
    this.initTitle();
    this.submitForm = this.fb.group({
      level: new FormControl('', [Validators.required]),
      category: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required]),
      status: new FormControl('', [Validators.required]),
      minPoint: ['', Validators.required],
      maxPoint: ['', Validators.required],
    }, { validator: this.validateMaxPointGreaterThanMinPoint });

  }

  title: any;

  obs!: Subscription;

  private readonly unsubscribe$ = new Subject();
  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

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

  mileData: MileDTO[] = [];

  page: number = 1;
  limit: number = 10;
  search: string = '';
  sortBy: string = 'asc';
  totalData: number = 0;
  pageData: Array<number> = [];
  descStatus: string | null = null;

  image!: File | null;
  imageShow!: string | null;
  imageValidator: boolean | null = null;
  imageValidatorMessage!: string;

  mform: FormGroup = new FormGroup({
    search: new FormControl(''),
    page: new FormControl(this.page),
    limit: new FormControl(this.limit),
  });

  validateMaxPointGreaterThanMinPoint(group: FormGroup): ValidationErrors | null {
    const minPoint = group.get('minPoint')?.value;
    const maxPoint = group.get('maxPoint')?.value;

    if (minPoint && maxPoint && maxPoint <= minPoint) {
      return { maxPointLessThanMinPoint: true };
    }

    return null;
  }

  submitForm: FormGroup = new FormGroup({
    level: new FormControl('', [Validators.required]),
    category: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required]),
    maxPoint: new FormControl('', [Validators.required]),
    minPoint: new FormControl('', [Validators.required]),
    status: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    initTE({ Modal, Ripple, Select });
    this.getMilesData(this.page, this.limit, this.search, this.sortBy);
    this.obs = this.mform.valueChanges
      .pipe(debounceTime(500))
      .subscribe((data) => {
        if (data.page < 1) {
          data.page < 1 ? this.mform.get('page')?.setValue(1) : data.page;
        } else {
          this.getMilesData(data.page, data.limit, data.search, data.sortBy);
        }
      });
  }
  ngOnDestroy(): void {
    this.unsubscribe$.unsubscribe()
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

  // getMilesData
  getMilesData(
    page: number,
    limit: number,
    search: string,
    sortBy: string
  ): void {
    this.nexlevelservice.getMile(page, limit, search, sortBy)
      .pipe(
        catchError((err) => {
          console.error(err);
          err('error', err);
          return EMPTY;
        }),
        tap((data) => {
          if (data.data.result) {
            data.data.result.forEach((image) => {
              image.path =
                environment.httpUrl +
                '/v1/api/file-manager/get-imagepdf/' +
                image.path
            })
          }
        }),
        switchMap((response) => {
          this.mileData = response.data.result;
          this.totalData = response.data.total;
          this.paginate(this.totalData, this.limit, this.pageData);
          return Observable.create();
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe()
  }

  // getByUuid
  getByUuid(uuid: string): void {
    this.nexlevelservice.getMileByUuid(uuid)
      .pipe(
        catchError((err) => {
          console.error(err);
          err('error', err);
          return EMPTY;
        }),
        switchMap((response) => {
          this.submitForm.get('level')?.setValue(response.data.level);
          this.submitForm.get('category')?.setValue(response.data.category);
          this.submitForm.get('name')?.setValue(response.data.name);
          this.submitForm.get('minPoint')?.setValue(response.data.minPoint);
          this.submitForm.get('maxPoint')?.setValue(response.data.maxPoint);
          this.submitForm.get('status')?.setValue(response.data.status);
          this.imageValidator = true;
          this.imageShow =
            environment.httpUrl +
            '/v1/api/file-manager/get-imagepdf/' +
            response.data.path;
          this.nexlearningService
            .getImageFromUrl(this.imageShow)
            .subscribe((file) => {
              this.image = file;
            });
            return Observable.create()
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe()
  }

  async postCategory(): Promise<void> {
    try {
      if (this.submitForm.valid && this.imageValidator === true) {
        const minPoint = this.submitForm.get('minPoint')?.value;
        const maxPoint = this.submitForm.get('maxPoint')?.value;
        if (maxPoint <= minPoint) {
          this.submitForm.get('maxPoint')?.setErrors({ maxPointLessThanMinPoint: true });
          return;
        }
        const dto: MileCreateDTO = {
          image: this.image!,
          level: this.submitForm.get('level')?.value,
          category: this.submitForm.get('category')?.value,
          personalNumber: this.keycloackService.getUsername(),
          name: this.submitForm.get('name')?.value,
          minPoint: this.submitForm.get('minPoint')?.value,
          maxPoint: this.submitForm.get('maxPoint')?.value,
          status: this.submitForm.get('status')?.value,
        };
        this.nexlevelservice.createMile(dto).subscribe(() => {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Your miles was successfully created.',
            timer: 1000,
            showConfirmButton: false,
          }).then(() => {
            this.getMilesData(this.page, this.limit, this.search, this.sortBy);
            this.image = null;
            this.imageShow = null;
            this.imageValidator = null;
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
            if (!this.image) {
              this.imageValidator = false;
              this.imageValidatorMessage = 'Image is Required';
            }

          });
        });
      }
    } catch (error) {
      throw error;
    }
  }

  updateDataCategory(): void {
    try {
      if (this.submitForm.valid && this.imageValidator === true) {
        const dto: MileCreateDTO = {
          image: this.image!,
          level: this.submitForm.get('level')?.value,
          category: this.submitForm.get('category')?.value,
          personalNumber: this.keycloackService.getUsername(),
          name: this.submitForm.get('name')?.value,
          minPoint: this.submitForm.get('minPoint')?.value,
          maxPoint: this.submitForm.get('maxPoint')?.value,
          status: this.submitForm.get('status')?.value,
        };
        this.nexlevelservice.updateMile(this.uuid!, dto).subscribe(() => {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Your miles was successfully updated.',
            timer: 1000,
            showConfirmButton: false,
          }).then(() => {
            this.getMilesData(this.page, this.limit, this.search, this.sortBy);
            this.image = null;
            this.imageShow = null;
            this.imageValidator = null;
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
            if (!this.image) {
              this.imageValidator = false;
              this.imageValidatorMessage = 'Image is Required';
            }
          });
        });
      }
    } catch (error) {
      throw error;
    }
  }

  async deleteMilesData(uuid: string): Promise<void> {
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
          this.nexlevelservice.deleteMile(uuid).subscribe(() => {
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Your mile was successfully deleted.',
              timer: 1000,
              showConfirmButton: false,
            }).then(() => {
              this.getMilesData(
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
    this.imageValidator = null;
    this.image = null;
    this.imageShow = null;
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
      this.getByUuid(uuid!);
    }
    this.addOredit = addOredit;
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
}
