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
  faArrowCircleDown,
  faTrash,
  faCircleArrowLeft,
  faCircleXmark,
  faSadTear,
  faCircleChevronLeft,
  faCircleChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';
import { Subscription, debounceTime, filter, tap } from 'rxjs';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import { NexCommunityService } from 'src/app/pages/user/nex-community/nex-community.service';
import {
  CommunityDTO,
  CommunityMemberDTO,
  CommunityPublishDTO,
  RecentActivityDTO,
} from 'src/app/pages/user/nex-community/dto/community.dto';
import { Tab, Select, initTE } from 'tw-elements';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SoeDTO } from 'src/app/core/soe/soe.dto';
import { SoeService } from 'src/app/core/soe/soe.service';
import { NexLearningService } from 'src/app/pages/user/nex-learning/nex-learning.service';
import { environment } from 'src/environments/environment.prod';
import Swal from 'sweetalert2';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-community-detail',
  templateUrl: './community-detail.component.html',
  styleUrls: ['./community-detail.component.css'],
})
export class CommunityDetailComponent
  extends BaseController
  implements OnInit, OnDestroy
{
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private readonly nexcommunityService: NexCommunityService,
    private readonly nexlearningService: NexLearningService,
    private readonly soeService: SoeService,
    private readonly keycloakService: KeycloakService
  ) {
    super(CommunityDetailComponent.name);
  }

  obs!: Subscription;
  faArrowRight = faArrowRight;
  faCircleArrowLeft = faCircleArrowLeft;
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
  faArrowCircleDown = faArrowCircleDown;
  faCircleXmark = faCircleXmark;
  faTrash = faTrash;
  faSadTear = faSadTear;
  faCircleChevronLeft = faCircleChevronLeft;
  faCircleChevronRight = faCircleChevronRight;

  uuid!: string;
  files: File[] = [];
  check: any = [];
  addedFiles: any;

  dateCreated!: Date;

  image!: File;
  imageShow!: string;
  imageValidator: boolean | null = null;
  imageValidatorMessage!: string;

  imageCover!: File;
  imageShowCover!: string;
  imageValidatorCover: boolean | null = null;
  imageValidatorMessageCover!: string;

  imageLogo!: File;
  imageShowLogo!: string;
  imageValidatorLogo: boolean | null = null;
  imageValidatorMessageLogo!: string;

  title: any;
  edited: Boolean = false;
  load: boolean = true;

  personalName!: string;

  dataUser: SoeDTO[] = [];
  communityData!: CommunityDTO;

  mform: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    leader: new FormControl('', [Validators.required]),
    leaderPersonalNumber: new FormControl('', [Validators.required]),
    founded: new FormControl('', [Validators.required]),
    location: new FormControl('', [Validators.required]),
    about: new FormControl('', [Validators.required]),
    leaderProfile: new FormControl('', [Validators.required]),
    instagram: new FormControl('', [Validators.required]),

    status: new FormControl(),
    approveBy: new FormControl(),
  });

  communityId!: number;
  dataMember: Array<CommunityMemberDTO> = [];
  totalData: number = 0;
  pageData: Array<number> = [];
  page: number = 1;
  limit: number = 10;
  search: string = '';
  sortBy: string = 'createdAtDESC';

  mformMemberPage: FormGroup = new FormGroup({
    search: new FormControl('', [Validators.required]),
    page: new FormControl(this.page, [Validators.required]),
    limit: new FormControl(this.limit, [Validators.required]),
    sortBy: new FormControl(this.sortBy),
  });

  dataActivity: Array<RecentActivityDTO> = [];
  mformPaginate: FormGroup = new FormGroup({
    search: new FormControl('', [Validators.required]),
    page: new FormControl(this.page, [Validators.required]),
    limit: new FormControl(this.limit, [Validators.required]),
    sortBy: new FormControl(this.sortBy),
  });

  mformPaginateActivity: FormGroup = new FormGroup({
    search: new FormControl('', [Validators.required]),
    page: new FormControl(this.page, [Validators.required]),
    limit: new FormControl(this.limit, [Validators.required]),
    sortBy: new FormControl(this.sortBy),
  });

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.uuid = params['uuid'];
      this.getById(this.uuid);
    });
    this.activatedRoute.data.subscribe((data) => {
      this.title = data;
    });
    this.obs = this.mformMemberPage.valueChanges
      .pipe(debounceTime(500))
      .subscribe((data) => {
        if (data.page < 1) {
          this.mformMemberPage.get('page')?.setValue(1);
        } else {
          this.getMemberData(
            data.page,
            data.limit,
            data.search,
            this.sortBy,
            this.communityId
          );
        }
      });
    this.obs = this.mformPaginateActivity.valueChanges
      .pipe(debounceTime(500))
      .subscribe((data) => {
        if (data.page < 1) {
          this.mformPaginateActivity.get('page')?.setValue(1);
        } else {
          this.getDataActivity(
            data.page,
            data.limit,
            data.search,
            this.sortBy,
            this.communityId
          );
        }
      });
  }

  ngOnDestroy(): void {
    this.obs.unsubscribe();
  }

  ngAfterContentChecked(): void {
    initTE({ Tab, Select });
  }

  onSelect(event: { addedFiles: any }) {
    this.files.push(...event.addedFiles);
    this.check.push(1);
  }
  onRemove(event: File) {
    this.files.splice(this.files.indexOf(event), 1);
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

  onFileSelectedCover(event: any) {
    const file: File = event.target.files[0];
    this.imageValidation(file, 1).then((data) => {
      this.imageValidatorCover = data.status;
      this.imageValidatorMessageCover = data.message;
    });
    if (file) {
      this.imageCover = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imageShowCover = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  initTab(): void {
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

  //Get Community By UUID
  async getById(uuid: string): Promise<void> {
    this.nexcommunityService
      .getCommunityById(uuid)
      .pipe(
        tap((data) => {
          if (data.data) {
            data.data.headlinedPhotoPath =
              environment.httpUrl +
              '/v1/api/file-manager/get-imagepdf/' +
              data.data.headlinedPhotoPath;
            data.data.thumbnailPhotoPath =
              environment.httpUrl +
              '/v1/api/file-manager/get-imagepdf/' +
              data.data.thumbnailPhotoPath;
            data.data.icon =
              environment.httpUrl +
              '/v1/api/file-manager/get-imagepdf/' +
              data.data.icon;
            this.nexlearningService
              .getImageFromUrl(data.data.thumbnailPhotoPath)
              .subscribe((file) => {
                if (file) {
                  this.imageValidator = true;
                  this.image = file;
                }
              });
            this.nexlearningService
              .getImageFromUrl(data.data.headlinedPhotoPath)
              .subscribe((file) => {
                if (file) {
                  this.imageValidatorCover = true;
                  this.imageCover = file;
                }
              });
            this.nexlearningService
              .getImageFromUrl(data.data.icon)
              .subscribe((file) => {
                if (file) {
                  this.imageValidatorLogo = true;
                  this.imageLogo = file;
                }
              });
          }
        })
      )
      .subscribe((response) => {
        this.communityData = response.data;
        this.communityId = response.data.id;
        this.getMemberData(
          this.page,
          this.limit,
          this.search,
          this.sortBy,
          this.communityId
        );
        this.getDataActivity(
          this.page,
          this.limit,
          this.search,
          this.sortBy,
          this.communityId
        );
        this.soeService
          .getUserData(response.data.personalNumber)
          .subscribe((data) => {
            this.personalName = data.personalName;
            this.imageShowCover = response.data.headlinedPhotoPath;
            this.imageShow = response.data.thumbnailPhotoPath;
            this.imageShowLogo = response.data.icon;
            this.mform.get('name')?.setValue(response.data.name);
            this.mform
              .get('leaderPersonalNumber')
              ?.setValue(response.data.leaderPersonalNumber);
            this.mform
              .get('founded')
              ?.setValue(this.formatDateNow(response.data.founded));
            this.mform.get('location')?.setValue(response.data.location);
            this.mform.get('about')?.setValue(response.data.about);
            this.mform
              .get('leaderProfile')
              ?.setValue(response.data.leaderProfile);
            this.mform.get('instagram')?.setValue(response.data.instagram);
            this.getAllDataUser(response.data.leaderPersonalNumber);
            this.soeService
              .getUserData(this.mform.get('leaderPersonalNumber')?.value)
              .subscribe((response) => {
                this.mform.get('leader')?.setValue(response.personalName);
              });
          });
      });
  }

  //Update Community
  async updateCommunityData(): Promise<void> {
    this.soeService
      .getUserData(this.mform.get('leaderPersonalNumber')?.value)
      .subscribe((data) => {
        this.mform.get('leader')?.setValue(data.personalName);
        const dto: CommunityPublishDTO = {
          name: this.mform.get('name')?.value,
          personalNumber: this.keycloakService.getUsername(),
          location: this.mform.get('location')?.value,
          about: this.mform.get('about')?.value,
          leader: this.mform.get('leader')?.value,
          leaderProfile: this.mform.get('leaderProfile')?.value,
          instagram: this.mform.get('instagram')?.value,
          thumbnailPhotoFile: this.image,
          headlinePhotoFile: this.imageCover,
          leaderPersonalNumber: this.mform.get('leaderPersonalNumber')?.value,
          leaderUnit: data.personalUnit,
          leaderEmail: data.personalEmail,
          iconFile: this.imageLogo,
          founded: this.mform.get('founded')?.value,
        };
        this.nexcommunityService
          .updateCommunity(this.uuid, dto)
          .subscribe(() => {
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Your community was successfully updated.',
              timer: 1000,
              showConfirmButton: false,
            }).then(() => {
              this.router.navigate(['/admin/community']);
            });
          });
      });
  }

  //Get All User Data
  async getAllDataUser(personalName: string): Promise<void> {
    this.soeService.getUserByName(personalName).subscribe((response) => {
      this.dataUser = response;
      this.load = false;
    });
  }

  async searchData(event: any): Promise<void> {
    this.getAllDataUser(event.term);
  }

  editedMode() {
    this.edited = !this.edited;
  }

  //Get Member
  async getMemberData(
    page: number,
    limit: number,
    search: string,
    sortBy: string,
    communityId: number
  ): Promise<void> {
    try {
      this.nexcommunityService
        .getMember(page, limit, search, sortBy, communityId)
        .subscribe((response) => {
          this.totalData = response.data.total;
          this.dataMember = response.data.result;
          this.paginate(
            this.totalData,
            this.mformMemberPage.get('limit')?.value,
            this.pageData
          );
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

  async deleteMemberData(uuid: string): Promise<void> {
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
        this.nexcommunityService.deleteMember(uuid).subscribe(() => {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Member was successfully deleted.',
            timer: 1000,
            showConfirmButton: false,
          }).then(() => {
            this.getMemberData(
              this.page,
              this.limit,
              this.search,
              this.sortBy,
              this.communityId
            );
          });
        });
      }
    });
  }

  //Get Data Activity
  async getDataActivity(
    page: number,
    limit: number,
    search: string,
    sortBy: string,
    communityId: number
  ): Promise<void> {
    try {
      this.nexcommunityService
        .getActivity(page, limit, search, sortBy, communityId)
        .subscribe((response) => {
          this.totalData = response.data.total;
          this.dataActivity = response.data.result;
          this.paginate(
            this.totalData,
            this.mformPaginateActivity.get('limit')?.value,
            this.pageData
          );
        });
    } catch (error) {
      throw error;
    }
  }

  onFileSelectedLogo(event: any) {
    const file: File = event.target.files[0];
    this.imageValidation(file, 1).then((data) => {
      this.imageValidatorLogo = data.status;
      this.imageValidatorMessageLogo = data.message;
    });
    if (file) {
      this.imageLogo = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imageShowLogo = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
}
