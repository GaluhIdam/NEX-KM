
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { faArrowRight, faBell, faGear, faSearch, faFilter, faPrint, faCircleCheck, faEye, faStar, faBan, faXmark, faPencil, faPlus, faTrash, faTimes, faEdit, faRecycle, faCircleChevronLeft, faCircleChevronRight } from '@fortawesome/free-solid-svg-icons';
import { KeycloakService } from 'keycloak-angular';
import { EMPTY, Observable, Subject, Subscription, catchError, debounceTime, filter, switchMap, takeUntil, tap } from 'rxjs'
import { BaseController } from 'src/app/core/BaseController/base-controller';
import { NexTeamCreateDTO, NexTeamDTO } from 'src/app/core/dtos/homepage/nex_team';
import { UserListDTO } from 'src/app/core/dtos/homepage/user_list';
import { NexTeamService } from 'src/app/core/services/homepage/nex-team.service';
import { SoeDTO } from 'src/app/core/soe/soe.dto';
import { SoeService } from 'src/app/core/soe/soe.service';
import { HomePageService } from 'src/app/pages/user/home-page/homepage.service';
import { environment } from 'src/environments/environment.prod';
import Swal from 'sweetalert2';
import { Modal, initTE, Ripple } from 'tw-elements';

@Component({
  selector: 'app-nex-team',
  templateUrl: './nex-team.component.html',
  styleUrls: ['./nex-team.component.css']
})
export class NexTeamComponent extends BaseController implements OnInit, OnDestroy {

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private readonly homepageService: HomePageService,
    private readonly nexTeamService: NexTeamService,
    private readonly keycloackService: KeycloakService,
    private readonly soeService: SoeService
  ) {
    super(NexTeamComponent.name);
    this.initTitlePage();
    this.isLoading = false;
  }

  faArrowRight = faArrowRight
  faBell = faBell
  faGear = faGear
  faSearch = faSearch
  faFilter = faFilter
  faPrint = faPrint
  faCircleCheck = faCircleCheck
  faEye = faEye
  faStar = faStar
  faBan = faBan
  faXmark = faXmark
  faPencil = faPencil
  faPlus = faPlus
  faTrash = faTrash
  faTimes = faTimes
  faEdit = faEdit
  faRecycle = faRecycle
  faCircleChevronLeft = faCircleChevronLeft;
  faCircleChevronRight = faCircleChevronRight;

  private readonly unsubscribe$ = new Subject();
  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  titlePage: any;
  obs!: Subscription;
  id!: number | null;
  uuid!: string | null;
  personnelNumber!: string | null;
  addOredit!: boolean;

  userName!: string;
  isLoading: boolean;

  // merchandise directory data
  userList: UserListDTO[] = [];
  nexTeam: NexTeamDTO[] = [];

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
    personnelNumber: new FormControl('', [Validators.required]),
    position: new FormControl('', [Validators.required]),
  });

  ngOnInit() {
    initTE({ Modal, Ripple });
    this.getUser(this.keycloackService.getUsername());
    this.getDataNexTeam(this.page, this.limit, this.search, this.sortBy);
    this.obs = this.mform.valueChanges
      .pipe(debounceTime(500))
      .subscribe((data) => {
        if (data.page < 1) {
          data.page < 1 ? this.mform.get('page')?.setValue(1) : data.page;
        } else {
          this.getDataNexTeam(
            data.page,
            data.limit,
            data.search,
            data.sortBy
          );
        }
      });
    this.getDataUserList(this.page, this.limit, this.search, this.sortBy);
  }

  //Get User
  getUser(personalNumber: string): void {
    this.soeService.getUserData(personalNumber)
      .pipe(
        catchError((err) => {
          console.error(err);
          err('error', err);
          return EMPTY;
        }),
        switchMap((result) => (
          this.userName = result.personalName
        )),
        takeUntil(this._onDestroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.unsubscribe();
  }

  initTitlePage(): void {
    this.activatedRoute.data.subscribe((data) => {
      this.titlePage = data;
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
  getDataUserList(
    page: number,
    limit: number,
    search: string,
    sortBy: string
  ): void {
    this.nexTeamService
      .getUserList(
        page, limit, search, sortBy
      )
      .pipe(
        catchError((err) => {
          console.error(err);
          err('error', err);
          return EMPTY;
        }),
        switchMap((response) => {
          this.userList = response.data.result;
          console.log(this.userList)
          this.totalData = response.data.total;
          this.paginate(this.totalData, this.limit, this.pageData);
          return Observable.create();
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe();
  }

  // getDataPoint
  async getDataNexTeam(
    page: number,
    limit: number,
    search: string,
    sortBy: string
  ): Promise<void> {
    try {
      this.nexTeamService
        .getNexTeam(page, limit, search, sortBy)
        .pipe(
          tap((data) => {
            if (data.data.result) {
              data.data.result.forEach((image) => {
                image.path =
                  environment.httpUrl +
                  '/v1/api/file-manager/get-imagepdf/' +
                  image.path;
                this.soeService
                  .getUserData(image.personnelNumber)
                  .subscribe((response) => {
                    image.personalName = response.personalName;
                    image.personalEmail = response.personalEmail;
                    image.personalUnit = response.personalUnit;
                  });
              });
            }
          })
        )
        .subscribe((response) => {
          this.nexTeam = response.data.result;
          this.totalData = response.data.total;
          this.paginate(this.totalData, this.limit, this.pageData);
        });
    } catch (error) {
      throw error;
    }
  }

  getByUuid(uuid: string): void {
    this.nexTeamService.getNexTeamByUuid(uuid)
      .pipe(
        catchError((err) => {
          console.error(err);
          err('error', err);
          return EMPTY;
        }),
        switchMap((response) => {
          this.submitForm.get('personnelNumber')?.setValue(response.data.personnelNumber);
          this.submitForm.get('position')?.setValue(response.data.position);
          return Observable.create()
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe()
  }

  postNexTeam(): void {
    try {
      if (this.submitForm.valid) {
        const dto: NexTeamCreateDTO = {
          personnelNumber: this.submitForm.get('personnelNumber')?.value,
          position: this.submitForm.get('position')?.value,
        };
        this.nexTeamService.createNexTeam(dto).subscribe(() => {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Your point config was successfully created.',
            timer: 1000,
            showConfirmButton: false,
          }).then(() => {
            this.getDataNexTeam(
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

  async updateNexTeam(): Promise<void> {
    try {
      if (this.submitForm.valid) {
        const dto: NexTeamCreateDTO = {
          personnelNumber: this.submitForm.get('personnelNumber')?.value,
          position: this.submitForm.get('position')?.value,
        };
        this.nexTeamService
          .updateNexTeam(this.personnelNumber!, dto)
          .subscribe(() => {
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Your point config was successfully updated.',
              timer: 1000,
              showConfirmButton: false,
            }).then(() => {
              this.getDataNexTeam(
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

  async deleteNexTeam(uuid: string): Promise<void> {
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
          this.nexTeamService.deleteNexTeam(uuid).subscribe(() => {
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Your point config was successfully deleted.',
              timer: 1000,
              showConfirmButton: false,
            }).then(() => {
              this.getDataNexTeam(
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

  reset(): void {
    this.submitForm.reset();
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

  callModal(
    title: string | null,
    id: number | null,
    uuid: string | null,
    personnelNumber: string | null,
    addOredit: boolean
  ): void {
    this.submitForm.reset();
    if (uuid) {
      this.id = id;
      this.uuid = uuid;
      this.getByUuid(uuid);
      this.personnelNumber = personnelNumber;
    }
    this.addOredit = addOredit;
  }

}
