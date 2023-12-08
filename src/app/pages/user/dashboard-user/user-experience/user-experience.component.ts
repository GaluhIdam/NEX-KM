import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { faCircleCheck } from '@fortawesome/free-regular-svg-icons';
import {
  faSearch,
  faBookOpen,
  faBullhorn,
  faBell,
  faGear,
  faPencil,
  faPlus,
  faCheck,
  faXmark,
  faChevronRight,
  faEllipsis,
  faPenToSquare,
  faEllipsisVertical,
  faClock,
  faArrowRight,
  faTimes,
  faCircleChevronLeft,
  faCircleChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import { SharingExperienceDTO } from 'src/app/core/dtos/homepage/sharing-experience';
import { Modal, initTE, Ripple } from 'tw-elements';
import { HomePageService } from '../../home-page/homepage.service';
import { KeycloakService } from 'keycloak-angular';
import { SoeService } from 'src/app/core/soe/soe.service';
import {
  Subject,
  Subscription,
  debounceTime,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import { SharingCreateDTO, SharingDTO } from '../../home-page/dtos/sharing.dto';
import { NexLearningService } from '../../nex-learning/nex-learning.service';
import Swal from 'sweetalert2';
import { LocalService } from 'src/app/core/services/local/local.service';
import { LocationService } from 'src/app/core/services/location/location.service';
import {
  Country,
  countryDefaultData,
} from 'src/app/core/dtos/location/country.dto';
import { State, stateDefaultData } from 'src/app/core/dtos/location/state.dto';
import { City } from 'src/app/core/dtos/location/city.dto';
import * as moment from 'moment';

@Component({
  selector: 'app-user-experience',
  templateUrl: './user-experience.component.html',
  styleUrls: ['./user-experience.component.css'],
})
export class UserExperienceComponent
  extends BaseController
  implements OnInit, OnDestroy
{
  linked_icon = '../../../../assets/image/footer/linked-icon.png';
  instagram_icon = '../../../../assets/image/footer/instagram-icon.png';
  facebook_icon = '../../../../assets/image/fb.png';
  bg_library = '../../../../assets/image/library/bg-library.jpg';
  faSearch = faSearch;
  faBookOpen = faBookOpen;
  faBullhorn = faBullhorn;
  faBell = faBell;
  faGear = faGear;
  faPencil = faPencil;
  faPlus = faPlus;
  faCheck = faCheck;
  faXmark = faXmark;
  faChevronRight = faChevronRight;
  faEllipsis = faEllipsis;
  faPenToSquare = faPenToSquare;
  faEllipsisVertical = faEllipsisVertical;
  faClock = faClock;
  faTimes = faTimes;
  faArrowRight = faArrowRight;
  faCircleCheck = faCircleCheck;
  faCircleChevronRight = faCircleChevronRight;
  faCircleChevronLeft = faCircleChevronLeft;

  @Input() personalNumber!: string;

  id!: number | null;
  uuid!: string | null;
  addOredit!: boolean;

  obs!: Subscription;
  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  title: any;

  //Image Validation
  image!: File | null;
  imageShow: string = '../../../../../../assets/image/sliders/slider-image.png';
  imageValidator!: boolean | null;
  imageValidatorMessage!: string;

  dataSharing: SharingDTO[] = [];
  dataSharingCountry: Country[] = [];
  dataSharingState: State[] = [];

  page: number = 1;
  limit: number = 5;
  search: string = '';
  sortBy: string = 'desc';
  isAdmin: boolean = true;
  totalData: number = 0;
  pageData: Array<number> = [];
  isLoading: boolean = false;
  formLoading: boolean = false;

  authToken: string = '';

  countries: Country[] = [];
  states: State[] = [];
  cities: City[] = [];

  countriesLoading: boolean = false;
  statesLoading: boolean = false;
  citiesLoading: boolean = false;

  mform: FormGroup = new FormGroup({
    search: new FormControl(''),
    page: new FormControl(this.page),
    limit: new FormControl(this.limit),
    sortBy: new FormControl(this.sortBy),
  });

  submitForm: FormGroup = new FormGroup({
    title: new FormControl('', [Validators.required]),
    place: new FormControl('', [Validators.required]),
    date: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    country_iso: new FormControl(undefined, [Validators.required]),
    state_iso: new FormControl(undefined),
    city_name: new FormControl(undefined),
  });

  constructor(
    private readonly homePageService: HomePageService,
    private readonly keycloakService: KeycloakService,
    private readonly soeService: SoeService,
    private readonly formBuilder: FormBuilder,
    private readonly nexlearningService: NexLearningService,
    private readonly localService: LocalService,
    private readonly locationService: LocationService
  ) {
    super(UserExperienceComponent.name);
  }

  ngOnInit(): void {
    initTE({ Modal, Ripple });
    this.initCountries();

    this.getDataSharingExp(
      this.page,
      this.limit,
      this.search,
      this.sortBy,
      this.isAdmin,
      this.personalNumber
    );
    this.obs = this.mform.valueChanges
      .pipe(debounceTime(500))
      .subscribe((data) => {
        if (data.page < 1) {
          data.page < 1 ? this.mform.get('page')?.setValue(1) : data.page;
        } else {
          this.getDataSharingExp(
            data.page,
            data.limit,
            data.search,
            data.sortBy,
            this.isAdmin,
            this.personalNumber
          );
        }
      });
  }
  ngOnDestroy(): void {
    this.obs.unsubscribe();

    this._onDestroy$.next(true);
    this._onDestroy$.unsubscribe();
  }

  //Get sharing
  async getDataSharingExp(
    page: number,
    limit: number,
    search: string,
    sortBy: string,
    isAdmin: boolean,
    personalNumber?: string
  ): Promise<void> {
    try {
      this.isLoading = true;
      this.homePageService
        .getSharingExp(page, limit, search, sortBy, isAdmin, personalNumber)
        .pipe(
          tap((response) => {
            if (response.data.result) {
              this.dataSharingCountry = new Array(
                response.data.result.length
              ).fill(countryDefaultData);
              this.dataSharingState = new Array(
                response.data.result.length
              ).fill(stateDefaultData);
              const datas: SharingDTO[] = response.data.result;

              datas.map((data, index) => {
                this.getCountryDetailByCountryISO(data.country, index);
                this.getStateDetailByCountryISOAndStateISO(
                  data.country,
                  data.state,
                  index
                );
              });
            }
          }),
          takeUntil(this._onDestroy$)
        )
        .subscribe(
          (response) => {
            this.isLoading = false;
            this.dataSharing = response.data.result ?? [];
            this.totalData = response.data.total;
            this.paginate(this.totalData, this.limit, this.pageData);
          },
          (error) => {
            this.isLoading = false;
          }
        );
    } catch (error) {
      throw error;
    }
  }

  //Get Sharing By Uuid
  async getSharingExpByUuid(uuid: string): Promise<void> {
    try {
      this.formLoading = true;
      this.homePageService
        .getSharingExpByUuid(uuid)
        .pipe(
          tap((response) => {
            this.initStatesBySelectedCountry(response.data.country);
          }),
          takeUntil(this._onDestroy$)
        )
        .subscribe(
          (response) => {
            this.formLoading = false;
            this.uuid = response.data.uuid;
            this.submitForm.get('title')?.setValue(response.data.title);
            this.submitForm.get('place')?.setValue(response.data.place);
            this.submitForm
              .get('description')
              ?.setValue(response.data.description);
            this.submitForm.get('date')?.setValue(response.data.date);
            this.submitForm.get('country_iso')?.setValue(response.data.country);
            this.submitForm.get('state_iso')?.setValue(response.data.state);
            this.submitForm.get('city_name')?.setValue(response.data.city);
          },
          (error) => {
            this.formLoading = false;
            throw error;
          }
        );
    } catch (error) {
      throw error;
    }
  }

  //Create Sharing
  async postSharing(): Promise<void> {
    try {
      if (this.submitForm.valid) {
        this.soeService
          .getUserData(this.keycloakService.getUsername())
          .subscribe((response) => {
            const dto: SharingCreateDTO = {
              personalNumber: this.keycloakService.getUsername(),
              title: this.submitForm.get('title')?.value,
              place: this.submitForm.get('place')?.value,
              date: this.submitForm.get('date')?.value,
              country: this.submitForm.get('country_iso')?.value ?? '',
              state: this.submitForm.get('state_iso')?.value ?? '',
              city: this.submitForm.get('city_name')?.value ?? '',
              description: this.submitForm.get('description')?.value,
            };
            this.homePageService.createSharingExp(dto).subscribe(() => {
              Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Your slider was successfully created.',
                timer: 1000,
                showConfirmButton: false,
              }).then(() => {
                this.reset();
                this.getDataSharingExp(
                  this.page,
                  this.limit,
                  this.search,
                  this.sortBy,
                  this.isAdmin,
                  this.personalNumber
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
          });
        });
      }
    } catch (error) {
      throw error;
    }
  }

  //Update Sharing
  async updateSharing(): Promise<void> {
    try {
      if (this.submitForm.valid) {
        this.soeService
          .getUserData(this.keycloakService.getUsername())
          .subscribe((response) => {
            const dto: SharingCreateDTO = {
              personalNumber: this.keycloakService.getUsername(),
              title: this.submitForm.get('title')?.value,
              place: this.submitForm.get('place')?.value,
              date: this.submitForm.get('date')?.value,
              country: this.submitForm.get('country_iso')?.value ?? '',
              state: this.submitForm.get('state_iso')?.value ?? '',
              city: this.submitForm.get('city_name')?.value ?? '',
              description: this.submitForm.get('description')?.value,
            };
            this.homePageService
              .updateSharingExp(this.uuid!, dto)
              .subscribe(() => {
                Swal.fire({
                  icon: 'success',
                  title: 'Success!',
                  text: 'Your slider was successfully updated.',
                  timer: 1000,
                  showConfirmButton: false,
                }).then(() => {
                  this.reset();
                  this.getDataSharingExp(
                    this.page,
                    this.limit,
                    this.search,
                    this.sortBy,
                    this.isAdmin,
                    this.personalNumber
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
          });
        });
      }
    } catch (error) {
      throw error;
    }
  }

  //Delete Slider
  async deleteDataSharing(uuid: string): Promise<void> {
    try {
      Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          this.homePageService.deleteSharingExp(uuid).subscribe(() => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Slider has deleted.',
              timer: 1000,
              showConfirmButton: false,
            }).then(() => {
              this.getDataSharingExp(
                this.page,
                this.limit,
                this.search,
                this.sortBy,
                this.isAdmin,
                this.personalNumber
              );
            });
          });
        }
      });
    } catch (error) {
      throw error;
    }
  }

  //Get All Countries
  initCountries(): void {
    this.countriesLoading = true;
    this.locationService
      .getCountries()
      .pipe(takeUntil(this._onDestroy$))
      .subscribe(
        (response) => {
          this.countries = response;
          this.countriesLoading = false;
        },
        (error) => {
          this.countriesLoading = false;
          console.log('error fetching countries', error);
        }
      );
  }

  //Get All States
  initStatesBySelectedCountry(countryISO: string): void {
    this.statesLoading = true;
    this.locationService
      .getStatesBySelectedCountry(countryISO)
      .pipe(takeUntil(this._onDestroy$))
      .subscribe(
        (response) => {
          this.states = response;
          this.statesLoading = false;
        },
        (error) => {
          this.statesLoading = false;
          console.log('error fetching states', error);
        }
      );
  }

  getCountryDetailByCountryISO(countryISO: string, index: number): void {
    this.locationService
      .getCountryDetail(countryISO)
      .pipe(takeUntil(this._onDestroy$))
      .subscribe(
        (response) => {
          this.dataSharingCountry[index] = response;
        },
        (error) => {
          console.log('error fetching country', error);
        }
      );
  }

  getStateDetailByCountryISOAndStateISO(
    countryISO: string,
    stateISO: string,
    index: number
  ): void {
    this.locationService
      .getStateDetail(countryISO, stateISO)
      .pipe(takeUntil(this._onDestroy$))
      .subscribe(
        (response) => {
          this.dataSharingState[index] = response;
        },
        (error) => {
          console.log('error fetching state', error);
        }
      );
  }

  onChangeCountry(countryISO: string) {
    this.submitForm.get('state_iso')?.setValue(undefined);
    this.submitForm.get('city_name')?.setValue(undefined);
    if (countryISO === undefined) {
      this.states = [];
      this.cities = [];
      return;
    }
    this.statesLoading = true;
    this.locationService
      .getStatesBySelectedCountry(countryISO)
      .pipe(takeUntil(this._onDestroy$))
      .subscribe(
        (response) => {
          this.states = response;
          this.statesLoading = false;
        },
        (error) => {
          this.statesLoading = false;
          console.log('error fetching states', error);
        }
      );
  }

  onChangeState(stateISO: string) {
    this.submitForm.get('city_name')?.setValue(undefined);

    if (stateISO === undefined) {
      this.cities = [];
      return;
    }

    if (this.submitForm.get('country_iso')?.value !== '') {
      this.citiesLoading = true;
      this.locationService
        .getCitiesBySelectedCountryAndSelectedState(
          this.submitForm.get('country_iso')?.value,
          stateISO
        )
        .pipe(takeUntil(this._onDestroy$))
        .subscribe(
          (response) => {
            this.cities = response;
            this.citiesLoading = false;
          },
          (error) => {
            this.citiesLoading = false;
            console.log('error fetching cities', error);
          }
        );
    }
  }

  nextPage(): void {
    if (
      this.pageData.length > 1 &&
      this.mform.get('page')?.value < this.pageData.length
    ) {
      this.mform.get('page')?.setValue(this.mform.get('page')?.value + 1);
    }
  }
  changePage(page: number): void {
    if (this.pageData.length) {
      this.mform.get('page')?.setValue(page);
    }
  }
  prevPage(): void {
    if (this.pageData.length > 1 && this.mform.get('page')?.value > 1) {
      this.mform.get('page')?.setValue(this.mform.get('page')?.value - 1);
    }
  }

  reset(): void {
    this.submitForm.reset();
  }

  callModal(id: number | null, uuid: string | null, addOredit: boolean): void {
    this.id = id;
    this.uuid = uuid;
    this.addOredit = addOredit;
    if (uuid) {
      this.getSharingExpByUuid(uuid);
    }
  }

  formattedDate(date: string): string {
    return moment(date).format('LL');
  }
}
