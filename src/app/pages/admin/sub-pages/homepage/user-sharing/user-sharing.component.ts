import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
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
  faTimes,
  faEdit,
  faRecycle,
  faArrowLeft,
  faBookmark,
  faCircleChevronLeft,
  faCircleChevronRight,
  faListCheck,
  faSadTear,
} from '@fortawesome/free-solid-svg-icons';
import { KeycloakService } from 'keycloak-angular';
import { Subscription, debounceTime, filter, tap } from 'rxjs';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import {
  SharingDTO,
  SharingExpStatusDTO,
} from 'src/app/pages/user/home-page/dtos/sharing.dto';
import { HomePageService } from 'src/app/pages/user/home-page/homepage.service';
import { SharingExperienceComponent } from 'src/app/pages/user/home-page/sub-pages/view-user/sharing-experience/sharing-experience.component';
import { environment } from 'src/environments/environment.prod';
import Swal from 'sweetalert2';
import { Modal, Ripple, initTE } from 'tw-elements';
import { NexLearningService } from 'src/app/pages/user/nex-learning/nex-learning.service';
import { SoeService } from 'src/app/core/soe/soe.service';

@Component({
  selector: 'app-user-sharing',
  templateUrl: './user-sharing.component.html',
  styleUrls: ['./user-sharing.component.css'],
})
export class UserSharingComponent
  extends BaseController
  implements OnInit, OnDestroy
{
  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly titleService: Title,
    private readonly sharingexp: HomePageService,
    private readonly keycloakService: KeycloakService,
    private readonly nexlearningService: NexLearningService,
    private readonly soeService: SoeService
  ) {
    super(SharingExperienceComponent.name);
    this.initTitle();
  }

  faArrowRight = faArrowRight;
  faArrowLeft = faArrowLeft;
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
  faTimes = faTimes;
  faEdit = faEdit;
  faRecycle = faRecycle;
  faBookmark = faBookmark;
  faCircleChevronLeft = faCircleChevronLeft;
  faCircleChevronRight = faCircleChevronRight;
  faSadTear = faSadTear;
  faListCheck = faListCheck;

  title: any;

  obs!: Subscription;

  id!: number | null;
  uuid!: string;
  addOredit!: boolean;
  head!: string;
  page: number = 1;
  limit: number = 10;
  search: string = '';
  sortBy: string = 'desc';
  totalData: number = 0;
  pageData: Array<number> = [];

  sharingData: SharingDTO[] = [];

  status!: boolean;

  mform: FormGroup = new FormGroup({
    search: new FormControl(''),
    page: new FormControl(this.page),
    limit: new FormControl(this.limit),
    sortBy: new FormControl(this.sortBy),
  });

  submitForm: FormGroup = new FormGroup({
    personalNumber: new FormControl('', [Validators.required]),
    title: new FormControl('', [Validators.required]),
    place: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    eventDate: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    initTE({ Modal, Ripple });
    this.getSharing(this.page, this.limit, this.search, this.sortBy);
    this.obs = this.mform.valueChanges
      .pipe(debounceTime(500))
      .subscribe((data) => {
        if (data.page < 1) {
          data.page < 1 ? this.mform.get('page')?.setValue(1) : data.page;
        } else {
          this.getSharing(data.page, data.limit, data.search, data.sortBy);
        }
      });
  }

  ngDoCheck(): void {
    initTE({ Modal, Ripple });
  }

  ngOnDestroy(): void {
    this.obs.unsubscribe();
  }

  //Init Title
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

  //Get Sharing Exp
  async getSharing(
    page: number,
    limit: number,
    search: string,
    sortBy: string
  ): Promise<void> {
    try {
      this.sharingexp
        .getSharingExp(page, limit, search, sortBy, true)
        .pipe(
          tap((data) => {
            if (data.data.result) {
              data.data.result.forEach((image) => {
                image.path =
                  environment.httpUrl +
                  '/v1/api/file-manager/get-imagepdf/' +
                  image.path;
                this.soeService
                  .getUserData(image.personalNumber)
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
          this.sharingData = response.data.result;
          console.log(this.sharingData)
          this.totalData = response.data.total;
          this.paginate(this.totalData, this.limit, this.pageData);
        });
    } catch (error) {
      throw error;
    }
  }

  //Get Sharing Exp By Uuid
  async getByUuid(uuid: string): Promise<void> {
    try {
      this.sharingexp.getSharingExpByUuid(uuid).subscribe((response) => {
        this.uuid = response.data.uuid;
        this.status = response.data.approvalStatus;
        this.submitForm.get('title')?.setValue(response.data.title);
        this.submitForm
          .get('personalNumber')
          ?.setValue(response.data.personalNumber);
        this.submitForm.get('place')?.setValue(response.data.description);
        this.submitForm.get('description')?.setValue(response.data.description);
        this.submitForm
          .get('eventDate')
          ?.setValue(this.formatDateNow(response.data.createdAt));
        this.submitForm.disable();
      });
    } catch (error) {
      throw error;
    }
  }

  //Approve or Reject Action
  async approveReject(status: boolean): Promise<void> {
    try {
      const dto: SharingExpStatusDTO = {
        approvalStatus: status,
        approvedBy: this.keycloakService.getUsername(),
      };
      this.sharingexp.approveReject(this.uuid, dto).subscribe(() => {
        if (status == true) {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Sharing Experience was approved.',
            timer: 1000,
            showConfirmButton: false,
          }).then(() => {
            this.submitForm.reset();
            this.getSharing(this.page, this.limit, this.search, this.sortBy);
          });
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Sharing Experience was rejected.',
            timer: 1000,
            showConfirmButton: false,
          }).then(() => {
            this.submitForm.reset();
            this.getSharing(this.page, this.limit, this.search, this.sortBy);
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

  resetFrom(): void {
    this.submitForm.reset();
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
}
