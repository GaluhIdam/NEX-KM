import { Subscription, debounceTime, tap } from 'rxjs';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  faUsers,
  faLocationPin,
  faCalendar,
  faChevronRight,
  faPlus,
  faSearch,
  faEdit,
  faTrash,
  faArrowRight,
  faPencil,
  faCircleChevronLeft,
  faCircleChevronRight,
  faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import { NexCommunityService } from '../../nex-community.service';
import { KeycloakService } from 'keycloak-angular';
import {
  CommunityDTO,
  CommunityMemberCreateDTO,
  CommunityMemberDTO,
  RoleCommunityDTO,
} from '../../dto/community.dto';
import { Select, Modal, initTE } from 'tw-elements';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SoeService } from 'src/app/core/soe/soe.service';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-list-member',
  templateUrl: './list-member.component.html',
  styleUrls: ['./list-member.component.css'],
})
export class ListMemberComponent
  extends BaseController
  implements OnInit, OnDestroy
{
  constructor(
    private readonly router: Router,
    private readonly activeRoute: ActivatedRoute,
    private readonly nexcommunityService: NexCommunityService,
    readonly keycloakService: KeycloakService,
    private readonly soeService: SoeService
  ) {
    initTE({ Select, Modal });
    super(ListMemberComponent.name);
  }

  photo!: string;
  photo_default: string =
    'https://st3.depositphotos.com/1767687/16607/v/450/depositphotos_166074422-stock-illustration-default-avatar-profile-icon-grey.jpg';

  obs!: Subscription;

  faUsers = faUsers;
  faArrowRight = faArrowRight;
  faLocationPin = faLocationPin;
  faCalendar = faCalendar;
  faChevronRight = faChevronRight;
  faPlus = faPlus;
  faSearch = faSearch;
  faEdit = faEdit;
  faTrash = faTrash;
  faPencil = faPencil;
  faCircleChevronLeft = faCircleChevronLeft;
  faCircleChevronRight = faCircleChevronRight;
  faMagnifyingGlass = faMagnifyingGlass;

  personalName!: string;
  email!: string;

  dataRole: Array<RoleCommunityDTO> = [];

  dataMember: Array<CommunityMemberDTO> = [];
  totalData: number = 0;
  pageData: Array<number> = [];
  page: number = 1;
  limit: number = 10;
  search: string = '';
  sortBy: string = 'createdAtDESC';
  communityId!: number;

  uuid!: string;
  uuidMember!: string;
  communityDetail: CommunityDTO = {
    id: 0,
    uuid: '',
    name: '',
    personalNumber: '',
    location: '',
    about: '',
    leader: '',
    leaderProfile: '',
    instagram: '',
    statusPublish: false,
    bannedStatus: false,
    thumbnailPhoto: '',
    thumbnailPhotoPath: '',
    headlinedPhoto: '',
    headlinedPhotoPath: '',
    createdAt: null,
    updatedAt: null,
    _count: {
      communitiesCommunityActivities: 0,
      communitiesCommunityFollows: 0,
      communitiesCommunityMembers: 0,
    },
    leaderPersonalNumber: '',
    icon: '',
    founded: new Date(),
  };

  mform: FormGroup = new FormGroup({
    personalNumber: new FormControl('', [Validators.required]),
    personalName: new FormControl('', [Validators.required]),
    personalEmail: new FormControl('', [Validators.required]),
    personalUnit: new FormControl('', [Validators.required]),
    role: new FormControl(null, [Validators.required]),
  });

  mformPaginate: FormGroup = new FormGroup({
    search: new FormControl('', [Validators.required]),
    page: new FormControl(this.page, [Validators.required]),
    limit: new FormControl(this.limit, [Validators.required]),
    sortBy: new FormControl(this.sortBy),
  });
  ngDoCheck(): void {
    initTE({ Select, Modal });
  }
  ngOnDestroy(): void {
    initTE({ Select, Modal });
    this.obs.unsubscribe();
  }
  ngOnInit(): void {
    initTE({ Select, Modal });
    this.activeRoute.params.subscribe((params: Params) => {
      const uuid = params['uuid'];
      this.uuid = params['uuid'];
      this.getByIdCommunity(uuid);
    });
    this.getRoleData();
    this.obs = this.mformPaginate.valueChanges
      .pipe(debounceTime(500))
      .subscribe((data) => {
        if (data.page < 1) {
          data.page < 1 ? this.mform.get('page')?.setValue(1) : data.page;
        } else {
          this.getMemberData(
            data.page,
            data.limit,
            data.search,
            data.sortBy,
            this.communityId
          );
        }
      });
  }

  //Get Data Communuty
  async getByIdCommunity(uuid: string): Promise<void> {
    this.nexcommunityService
      .getCommunityById(uuid)
      .pipe(
        tap((data) => {
          data.data.headlinedPhotoPath =
            environment.httpUrl +
            '/v1/api/file-manager/get-imagepdf/' +
            data.data.headlinedPhotoPath;
          data.data.thumbnailPhotoPath =
            environment.httpUrl +
            '/v1/api/file-manager/get-imagepdf/' +
            data.data.thumbnailPhotoPath;
        })
      )
      .subscribe((response) => {
        this.communityId = response.data.id;
        this.getMemberData(
          this.page,
          this.limit,
          this.search,
          this.sortBy,
          this.communityId
        );
        this.checkphoto(response.data.leaderPersonalNumber);
        this.communityDetail = response.data;
        this.soeService
          .getUserData(response.data.leaderPersonalNumber)
          .subscribe((data) => {
            this.email = data.personalEmail;
          });
        this.mform.get('personalName')?.disable();
        this.mform.get('personalEmail')?.disable();
        this.mform.get('personalUnit')?.disable();
      });
  }

  //Get Data Role
  async getRoleData(): Promise<void> {
    this.nexcommunityService.getRoleAll().subscribe((response) => {
      this.dataRole = response.data.result;
    });
  }

  //findData
  async findDataSOE(personalNumber: string): Promise<void> {
    this.getDataUser(personalNumber);
  }

  //Get User Data
  async getDataUser(personalNumber: string): Promise<void> {
    try {
      this.soeService.getUserData(personalNumber).subscribe((response) => {
        this.mform.get('personalName')?.setValue(response.personalName);
        this.mform.get('personalEmail')?.setValue(response.personalEmail);
        this.mform.get('personalUnit')?.setValue(response.personalUnit);
      });
    } catch (error) {
      throw error;
    }
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
            this.mformPaginate.get('limit')?.value,
            this.pageData
          );
        });
    } catch (error) {
      throw error;
    }
  }

  //Create Member
  async createMemberData(): Promise<void> {
    try {
      if (this.mform.valid) {
        const dto: CommunityMemberCreateDTO = {
          communityId: this.communityDetail.id,
          communityRoleId: Number(this.mform.get('role')?.value),
          personalNumber: this.mform.get('personalNumber')?.value,
          personalName: this.mform.get('personalName')?.value,
          personalUnit: this.mform.get('personalUnit')?.value,
          personalEmail: this.mform.get('personalEmail')?.value,
        };
        this.nexcommunityService.createMember(dto).subscribe(() => {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Member was successfully added.',
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
            this.getByIdCommunity(this.uuid);
            this.mform.reset();
          });
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed!',
          text: 'Please check your data before submit.',
          timer: 1000,
          showConfirmButton: false,
        }).then(() => {
          const myModalEl = document.getElementById('exampleModalCenter');
          const modal = new Modal(myModalEl);
          modal.show();
          Object.keys(this.mform.controls).forEach((key) => {
            const control = this.mform.get(key);
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

  //Update Member
  async updateMemberData(uuid: string): Promise<void> {
    try {
      if (this.mform.valid) {
        const dto: CommunityMemberCreateDTO = {
          communityId: this.communityDetail.id,
          communityRoleId: Number(this.mform.get('role')?.value),
          personalNumber: this.mform.get('personalNumber')?.value,
          personalName: this.mform.get('personalName')?.value,
          personalUnit: this.mform.get('personalUnit')?.value,
          personalEmail: this.mform.get('personalEmail')?.value,
        };
        this.nexcommunityService.updateMember(uuid, dto).subscribe(() => {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Member was successfully updated.',
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
            this.mform.reset();
          });
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed!',
          text: 'Please check your data before submit.',
          timer: 1000,
          showConfirmButton: false,
        }).then(() => {
          const myModalEl = document.getElementById('exampleModalCenter');
          const modal = new Modal(myModalEl);
          modal.show();
          Object.keys(this.mform.controls).forEach((key) => {
            const control = this.mform.get(key);
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

  resetForm(): void {
    this.mform.reset();
  }

  editModal(uuid: string, data: CommunityMemberCreateDTO): void {
    this.uuidMember = uuid;
    this.mform.get('personalNumber')?.setValue(data.personalNumber);
    this.findDataSOE(data.personalNumber);
    this.mform.get('role')?.setValue(data.communityRoleId);
  }

  //Check Photo
  private checkphoto(personal_number: any) {
    const imageUrl = `https://talentlead.gmf-aeroasia.co.id/images/avatar/${personal_number}.jpg`;
    const img = new Image();
    img.onload = () => {
      this.photo = imageUrl;
    };
    img.onerror = () => {
      const defaultImageUrl =
        'https://st3.depositphotos.com/1767687/16607/v/450/depositphotos_166074422-stock-illustration-default-avatar-profile-icon-grey.jpg';
      this.photo = defaultImageUrl;
    };
    img.src = imageUrl;
  }

  addMember(): void {
    this.router.navigate(['/nex-community/add-member']);
  }

  editMember(): void {
    this.router.navigate(['/nex-community/edit-member']);
  }
}
