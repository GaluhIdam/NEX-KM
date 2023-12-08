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
import {
  EMPTY,
  Observable,
  Subject,
  Subscription,
  async,
  catchError,
  debounceTime,
  filter,
  of,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { HeaderService } from 'src/app/core/services/header/header.service';
import { KeycloakService } from 'keycloak-angular';
import { environment } from 'src/environments/environment.prod';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import { NexLevelService } from 'src/app/pages/user/nex-level/nex-level.service';
import {
  MerchandiseCreateDTO,
  MerchandiseCreateMultipleDTO,
  MerchandiseDTO,
  MerchandiseImageDTO,
  MerchandiseImageDataDTO,
  MerchandiseImageUpdateDTO,
} from 'src/app/pages/user/nex-level/dtos/merchandise.dto';
import { Select, Modal, initTE } from 'tw-elements';
import { NexLearningService } from 'src/app/pages/user/nex-learning/nex-learning.service';
import { SocketService } from 'src/app/core/utility/socket-io-services/socket.io.service';
import { HomePageService } from 'src/app/pages/user/home-page/homepage.service';
import { NotificationRequestDTO } from 'src/app/pages/user/home-page/dtos/notification.dto';

@Component({
  selector: 'app-merchandise',
  templateUrl: './merchandise.component.html',
  styleUrls: ['./merchandise.component.css'],
})
export class MerchandiseComponent
  extends BaseController
  implements OnInit, OnDestroy {
  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly titleService: Title,
    private readonly formBuilder: FormBuilder,
    private readonly nexlevelService: NexLevelService,
    private readonly headerService: HeaderService,
    private readonly keycloakService: KeycloakService,
    private readonly nexlearningService: NexLearningService,
    private readonly webSocket: SocketService,
    private readonly homepageService: HomePageService
  ) {
    super(MerchandiseComponent.name);
    this.initTitle();
  }

  title: any;

  private readonly unsubscribe$ = new Subject();
  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  obs!: Subscription;

  id!: number | null;
  uuid!: string | null;
  addOredit!: boolean;
  head!: string;

  files: File[] = [];
  dataFiles: MerchandiseImageUpdateDTO[] = [];

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

  merchandiseId!: number;
  page: number = 1;
  limit: number = 12;
  search: string = '';
  sortBy: string = 'asc';
  optionx: string = 'false';
  totalData: number = 0;
  pageData: Array<number> = [];

  image!: File | null;
  imageMerchandise!: File | null;
  imageShow!: string | null;
  imageValidator: boolean | null = null;
  imageValidatorMessage!: string;
  descStatus: string | null = null;

  merchantData: MerchandiseDTO[] = [];

  mform: FormGroup = new FormGroup({
    search: new FormControl(''),
    page: new FormControl(this.page),
    limit: new FormControl(this.limit),
    sortBy: new FormControl(this.sortBy),
  });

  submitForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    image: new FormControl(''),
    description: new FormControl('', [Validators.required]),
    qty: new FormControl('', [Validators.required]),
    point: new FormControl('', [Validators.required]),
    status: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    initTE({ Select, Modal });
    this.getMerchat(this.page, this.limit, this.search, this.sortBy);
    this.obs = this.mform.valueChanges
      .pipe(debounceTime(500))
      .subscribe((data) => {
        if (data.page < 1) {
          data.page < 1 ? this.mform.get('page')?.setValue(1) : data.page;
        } else {
          this.getMerchat(data.page, data.limit, data.search, data.sortBy);
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

  // getMerchat
  async getMerchat(
    page: number,
    limit: number,
    search: string,
    sortBy: string
  ): Promise<void> {
    try {
      this.nexlevelService
        .getMerchandise(page, limit, search, sortBy)
        .pipe(
          tap((data) => {
            if (data.data.result) {
              data.data.result.forEach((image) => {
                image.imageMerchandise[0].path =
                  environment.httpUrl +
                  '/v1/api/file-manager/get-imagepdf/' +
                  image.imageMerchandise[0].path;
              });
            }
          })
        )
        .subscribe((response) => {
          this.merchantData = response.data.result;
          this.totalData = response.data.total;
          this.paginate(this.totalData, this.limit, this.pageData);
        });
    } catch (error) {
      throw error;
    }
  }

  async postMerchant(): Promise<void> {
    try {
      if (this.submitForm.valid) {
        const dto: MerchandiseCreateDTO = {
          personalNumber: this.keycloakService.getUsername(),
          title: this.submitForm.get('name')?.value,
          description: this.submitForm.get('description')?.value,
          qty: this.submitForm.get('qty')?.value,
          point: this.submitForm.get('point')?.value,
          isPinned: Boolean(this.submitForm.get('status')?.value),
        };
        this.nexlevelService
          .createMerchandise(dto)
          .pipe(
            tap((data) => {
              this.files.forEach((file) => {
                const dtx: MerchandiseImageDTO = {
                  personalNumber: this.keycloakService.getUsername(),
                  merchandiseId: data.data.id,
                  image: file,
                };
                this.nexlevelService.createImageMerchandise(dtx).subscribe();
              });
            })
          )
          .subscribe(() => {
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Your merchandise was successfully created.',
              timer: 1000,
              showConfirmButton: false,
            }).then(() => {
              this.getMerchat(this.page, this.limit, this.search, this.sortBy);
              this.image = null;
              this.imageShow = null;
              this.submitForm.reset();
              this.files = [];
              this.dataFiles = [];
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
          if (!this.image) {
            this.imageValidator = false;
            this.imageValidatorMessage = 'Image is Required';
          }
        });
      }
    } catch (error) {
      throw error;
    }
  }

  updateMerchant(): void {
    try {
      if (this.submitForm.valid && this.imageValidator === true) {
        const dto: MerchandiseCreateDTO = {
          personalNumber: this.keycloakService.getUsername(),
          title: this.submitForm.get('name')?.value,
          description: this.submitForm.get('description')?.value,
          qty: this.submitForm.get('qty')?.value,
          point: this.submitForm.get('point')?.value,
          isPinned: Boolean(this.submitForm.get('status')?.value),
        };
        this.nexlevelService
          .getMerchandiseByUuid(this.uuid!)
          .pipe(
            tap((data) => {
              data.data.imageMerchandise.forEach(async (image) => {
                try {
                  this.nexlevelService
                    .deleteImageMerchandise(image.uuid)
                    .subscribe();
                } catch (error) {
                  throw error;
                }
              });
            })
          )
          .subscribe(async () =>
            this.nexlevelService
              .updateMerchandise(this.uuid!, dto)
              .pipe(
                tap(() => {
                  this.dataFiles.forEach(async (xty) => {
                    try {
                      const data: MerchandiseImageDTO = {
                        merchandiseId: xty.merchandiseId,
                        personalNumber: xty.personalNumber,
                        image: xty.file,
                      };
                      this.nexlevelService
                        .createImageMerchandise(data)
                        .subscribe();
                    } catch (error) {
                      throw error;
                    }
                  });
                })
              )
              .subscribe(() => {
                Swal.fire({
                  icon: 'success',
                  title: 'Success!',
                  text: 'Your merchandise was successfully updated.',
                  timer: 1000,
                  showConfirmButton: false,
                }).then(() => {
                  this.getMerchat(
                    this.page,
                    this.limit,
                    this.search,
                    this.sortBy
                  );
                  this.image = null;
                  this.imageShow = null;
                  this.submitForm.reset();
                  this.files = [];
                  this.dataFiles = [];
                });
              })
          );
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

  async deleteMerchant(uuid: string): Promise<void> {
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
          this.nexlevelService.deleteMerchandise(uuid).subscribe(() => {
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Your merchandise was successfully deleted.',
              timer: 1000,
              showConfirmButton: false,
            }).then(() => {
              this.getMerchat(this.page, this.limit, this.search, this.sortBy);
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

  // getByUuid
  async getByUuid(uuid: string): Promise<void> {
    try {
      this.nexlevelService.getMerchandiseByUuid(uuid).subscribe((data) => {
        this.uuid = data.data.uuid;
        this.merchandiseId = data.data.id;
        this.submitForm.get('name')?.setValue(data.data.title);
        this.submitForm.get('description')?.setValue(data.data.description);
        this.submitForm.get('qty')?.setValue(data.data.qty);
        this.submitForm.get('point')?.setValue(data.data.point);
        this.submitForm.get('status')?.setValue(data.data.isPinned);
        this.imageValidator = true;
        data.data.imageMerchandise.forEach((file) => {
          this.nexlearningService
            .getImageFromUrl(
              environment.httpUrl +
                '/v1/api/file-manager/get-imagepdf/' +
                file.path
            )
            .subscribe((image) => {
              this.files.unshift(image);
              const xyz: MerchandiseImageUpdateDTO = {
                merchandiseId: file.merchandiseId,
                personalNumber: this.keycloakService.getUsername(),
                file: image,
              };
              this.dataFiles.unshift(xyz);
            });
        });
      });
    } catch (error) {
      throw error;
    }
  }

  resetFrom(): void {
    this.image = null;
    this.imageShow = null;
    this.imageValidator = null;
    this.submitForm.reset();
    this.files = [];
    this.dataFiles = [];
  }

  callModal(id: number | null, uuid: string | null, addOredit: boolean): void {
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
    this.imageValidation(file, 10).then((data) => {
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

  onSelect(event: any) {
    if (this.files.length + event.addedFiles.length <= 5) {
      this.files.push(...event.addedFiles);

      event.addedFiles.forEach((file: any) => {
        const xyz: MerchandiseImageUpdateDTO = {
          merchandiseId: this.merchandiseId,
          personalNumber: this.keycloakService.getUsername(),
          file: file,
        };
        this.dataFiles.push(xyz);
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: "You can't add more than 5 files.",
        timer: 1000,
        showConfirmButton: false,
      });

      event.addedFiles = [];
    }
  }

  onRemove(event: any) {
    this.files.splice(this.files.indexOf(event), 1);
    this.dataFiles.splice(this.files.indexOf(event), 1);
  }
}
