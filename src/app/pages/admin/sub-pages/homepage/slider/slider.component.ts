import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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
import { Subscription, debounceTime, filter, tap } from 'rxjs';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import { SoeService } from 'src/app/core/soe/soe.service';
import {
  SliderCreateDTO,
  SliderDTO,
} from 'src/app/pages/user/home-page/dtos/sliders.dto';
import { HomePageService } from 'src/app/pages/user/home-page/homepage.service';
import { NexLearningService } from 'src/app/pages/user/nex-learning/nex-learning.service';
import { environment } from 'src/environments/environment.prod';
import Swal from 'sweetalert2';
import { Modal, Ripple, initTE } from 'tw-elements';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.css'],
})
export class SliderComponent
  extends BaseController
  implements OnInit, OnDestroy
{
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private readonly hompageService: HomePageService,
    private readonly keycloakService: KeycloakService,
    private readonly nexlearningService: NexLearningService,
    private readonly soeService: SoeService
  ) {
    super(SliderComponent.name);
    this.initTitle();
  }

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

  id!: number | null;
  uuid!: string | null;
  addOredit!: boolean;

  obs!: Subscription;

  title: any;

  //Image Validation
  image!: File | null;
  imageShow: string = '../../../../../../assets/image/sliders/slider-image.png';
  imageValidator!: boolean | null;
  imageValidatorMessage!: string;

  dataSlider: SliderDTO[] = [];

  page: number = 1;
  limit: number = 5;
  search: string = '';
  sortBy: string = 'createdAtDESC';
  isAdmin: boolean = true;
  totalData: number = 0;
  pageData: Array<number> = [];
  descStatus: string | null = null;

  mform: FormGroup = new FormGroup({
    search: new FormControl(''),
    page: new FormControl(this.page),
    limit: new FormControl(this.limit),
  });

  submitForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    sequence: new FormControl('', [Validators.required]),
    image: new FormControl(''),
    status: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    initTE({ Modal, Ripple });
    this.getSliderData(
      this.page,
      this.limit,
      this.search,
      this.sortBy,
      this.isAdmin
    );
    this.obs = this.mform.valueChanges
      .pipe(debounceTime(500))
      .subscribe((data) => {
        if (data.page < 1) {
          data.page < 1 ? this.mform.get('page')?.setValue(1) : data.page;
        } else {
          this.getSliderData(
            data.page,
            data.limit,
            data.search,
            data.sortBy,
            true
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

  //Get Sliders
  async getSliderData(
    page: number,
    limit: number,
    search: string,
    sortBy: string,
    isAdmin: boolean
  ): Promise<void> {
    try {
      this.hompageService
        .getSliders(page, limit, search, sortBy, isAdmin)
        .pipe(
          tap((data) => {
            if (data.data.result) {
              data.data.result.forEach((dtx) => {
                dtx.backgroundImage =
                  environment.httpUrl +
                  '/v1/api/file-manager/get-imagepdf/' +
                  dtx.backgroundImage;
              });
            }
          })
        )
        .subscribe((response) => {
          this.dataSlider = response.data.result;
          this.totalData = response.data.total;
          this.paginate(this.totalData, this.limit, this.pageData);
        });
    } catch (error) {
      throw error;
    }
  }

  //Get Slider By Uuid
  async getByUuid(uuid: string): Promise<void> {
    try {
      this.reset();
      this.hompageService.getSliderByUuid(uuid).subscribe((response) => {
        this.imageShow =
          environment.httpUrl +
          '/v1/api/file-manager/get-imagepdf/' +
          response.data.backgroundImage;
        this.nexlearningService
          .getImageFromUrl(this.imageShow)
          .subscribe((file) => {
            this.image = file;
          });
        this.uuid = response.data.uuid;
        this.submitForm.get('image')?.setValue(this.image);
        this.submitForm.get('name')?.setValue(response.data.title);
        this.submitForm.get('description')?.setValue(response.data.description);
        this.submitForm.get('sequence')?.setValue(response.data.sequence);
        this.submitForm.get('status')?.setValue(response.data.status);
      });
    } catch (error) {
      throw error;
    }
  }

  //Create Slider
  async postSlider(): Promise<void> {
    try {
      if (this.submitForm.valid && this.imageValidator) {
        this.soeService
          .getUserData(this.keycloakService.getUsername())
          .subscribe((response) => {
            const dto: SliderCreateDTO = {
              personalNumber: this.keycloakService.getUsername(),
              title: this.submitForm.get('name')?.value,
              description: this.submitForm.get('description')?.value,
              image: this.image!,
              sequence: this.submitForm.get('sequence')?.value,
              uploadedBy: response.personalName,
              status: this.submitForm.get('status')?.value,
            };
            this.hompageService.createSlider(dto).subscribe(() => {
              Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Your slider was successfully created.',
                timer: 1000,
                showConfirmButton: false,
              }).then(() => {
                this.reset();
                this.getSliderData(
                  this.page,
                  this.limit,
                  this.search,
                  this.sortBy,
                  this.isAdmin
                );
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

  //Update Slider
  async updateSlider(): Promise<void> {
    try {
      if (
        this.submitForm.valid &&
        (this.imageValidator === true || this.imageValidator === null)
      ) {
        this.soeService
          .getUserData(this.keycloakService.getUsername())
          .subscribe((response) => {
            const dto: SliderCreateDTO = {
              personalNumber: this.keycloakService.getUsername(),
              title: this.submitForm.get('name')?.value,
              description: this.submitForm.get('description')?.value,
              image: this.image!,
              sequence: this.submitForm.get('sequence')?.value,
              uploadedBy: response.personalName,
              status: this.submitForm.get('status')?.value,
            };
            this.hompageService.updateSlider(this.uuid!, dto).subscribe(() => {
              Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Your slider was successfully updated.',
                timer: 1000,
                showConfirmButton: false,
              }).then(() => {
                this.reset();
                this.getSliderData(
                  this.page,
                  this.limit,
                  this.search,
                  this.sortBy,
                  this.isAdmin
                );
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

  //Delete Slider
  async deleteDataSlider(uuid: string): Promise<void> {
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
          this.hompageService.deleteSlider(uuid).subscribe(() => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Slider has deleted.',
              timer: 1000,
              showConfirmButton: false,
            }).then(() => {
              this.getSliderData(
                this.page,
                this.limit,
                this.search,
                this.sortBy,
                this.isAdmin
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
    this.image = null;
    this.imageValidator = null;
    this.imageShow = '../../../../../../assets/image/sliders/slider-image.png';
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

  callModal(id: number | null, uuid: string | null, addOredit: boolean): void {
    this.id = id;
    this.uuid = uuid;
    this.addOredit = addOredit;
    if (uuid) {
      this.getByUuid(uuid);
    }
  }
}
