import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  faUsers,
  faLocationPin,
  faCalendar,
  faInfoCircle,
  faChevronCircleRight,
  faChevronCircleLeft,
  faChevronRight,
  faPencil,
  faEye,
  faImage,
  faCircleArrowLeft,
  faCircleCheck,
  faArrowsRotate,
} from '@fortawesome/free-solid-svg-icons';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import { NexCommunityService } from '../../nex-community.service';
import {
  CommunityDTO,
  CommunityMemberDTO,
  CommunityPublishDTO,
  CreateFollowDTO,
  RecentActivityDTO,
} from '../../dto/community.dto';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import { KeycloakService } from 'keycloak-angular';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Modal, Select, initTE } from 'tw-elements';
import { SoeService } from 'src/app/core/soe/soe.service';
import Swal from 'sweetalert2';
import { SoeDTO } from 'src/app/core/soe/soe.dto';
import { NexLearningService } from '../../../nex-learning/nex-learning.service';
import { delay, tap } from 'rxjs';

@Component({
  selector: 'app-community-home',
  templateUrl: './community-home.component.html',
  styleUrls: ['./community-home.component.css'],
})
export class CommunityHomeComponent
  extends BaseController
  implements OnInit, OnDestroy
{
  constructor(
    private readonly router: Router,
    private readonly activeRoute: ActivatedRoute,
    private readonly nexcommunityService: NexCommunityService,
    readonly keycloakService: KeycloakService,
    private readonly nexlearningService: NexLearningService,
    private readonly soeService: SoeService
  ) {
    super(CommunityHomeComponent.name);
  }

  faUsers = faUsers;
  faLocationPin = faLocationPin;
  faCalendar = faCalendar;
  faInfoCircle = faInfoCircle;
  faChevronCircleRight = faChevronCircleRight;
  faChevronCircleLeft = faChevronCircleLeft;
  faChevronRight = faChevronRight;
  faPencil = faPencil;
  faEye = faEye;
  faImage = faImage;
  faCircleArrowLeft = faCircleArrowLeft;
  faCircleCheck = faCircleCheck;
  faArrowsRotate = faArrowsRotate;

  communityPersonalNumber!: string | null;
  communityUuidFollow!: string | null;

  dataMember: Array<CommunityMemberDTO> = [];
  totalData: number = 0;
  pageData: Array<number> = [];
  page: number = 1;
  limit: number = 10;
  search: string = '';
  sortBy: string = 'createdAtDESC';

  dataUser: SoeDTO[] = [];

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

  mformPaginate: FormGroup = new FormGroup({
    search: new FormControl('', [Validators.required]),
    page: new FormControl(this.page, [Validators.required]),
    limit: new FormControl(this.limit, [Validators.required]),
    sortBy: new FormControl(this.sortBy),
  });

  photo!: string;
  uuid!: string;
  dataActivity: Array<RecentActivityDTO> = [];
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

  personalName!: string;
  personalEmail!: string;

  mform: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    leaderPersonalNumber: new FormControl('', [Validators.required]),
    founded: new FormControl('', [Validators.required]),
    location: new FormControl('', [Validators.required]),
    about: new FormControl('', [Validators.required]),
    leaderProfile: new FormControl('', [Validators.required]),
    instagram: new FormControl('', [Validators.required]),

    status: new FormControl(),
    approveBy: new FormControl(),
  });

  ngDoCheck(): void {
    initTE({ Modal, Select });
  }
  ngOnDestroy(): void {}
  ngOnInit(): void {
    this.activeRoute.params.subscribe((params: Params) => {
      const uuid = params['uuid'];
      this.uuid = params['uuid'];
      this.getByIdCommunity(uuid);
    });
  }

  //Get Community By UUID
  async getByIdCommunity(uuid: string): Promise<void> {
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
            this.imageValidator = true;
            this.imageValidatorCover = true;
            this.imageValidatorLogo = true;
          }
        })
      )
      .subscribe((response) => {
        this.checkphoto(response.data.leaderPersonalNumber);
        this.communityDetail = response.data;
        this.checkFollower(
          this.keycloakService.getUsername(),
          response.data.id
        );
        this.getMemberData(
          this.page,
          12,
          this.search,
          this.sortBy,
          response.data.id
        );
        this.getDataActivity(
          this.page,
          4,
          this.search,
          this.sortBy,
          response.data.id
        );
        this.soeService
          .getUserData(response.data.leaderPersonalNumber)
          .subscribe((data) => {
            this.personalEmail = data.personalEmail;
            this.personalName = data.personalName;
            this.imageShowCover = response.data.headlinedPhotoPath;
            this.imageShow = response.data.thumbnailPhotoPath;
            this.imageShowLogo = response.data.icon;
            this.nexlearningService
              .getImageFromUrl(this.imageShow)
              .subscribe((file) => {
                this.image = file;
              });
            this.nexlearningService
              .getImageFromUrl(this.imageShowCover)
              .subscribe((file) => {
                this.imageCover = file;
              });
            this.nexlearningService
              .getImageFromUrl(this.imageShowLogo)
              .subscribe((file) => {
                this.imageLogo = file;
              });
            this.mform.get('name')?.setValue(response.data.name);
            this.mform
              .get('leaderPersonalNumber')
              ?.patchValue(response.data.leaderPersonalNumber);
            this.mform
              .get('founded')
              ?.setValue(this.formatDateNow(response.data.createdAt!));
            this.mform.get('founded')?.disable();
            this.mform.get('location')?.setValue(response.data.location);
            this.mform.get('about')?.setValue(response.data.about);
            this.mform
              .get('leaderProfile')
              ?.setValue(response.data.leaderProfile);
            this.mform.get('instagram')?.setValue(response.data.instagram);
            this.soeService
              .getUserData(this.mform.get('leaderPersonalNumber')?.value)
              .subscribe((response) => {
                this.mform.get('leader')?.setValue(response.personalName);
              });
            this.getAllDataUser(response.data.leaderPersonalNumber);
          });
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
        .pipe(
          tap((data) => {
            if (data.data.result) {
              data.data.result.forEach((image) => {
                image.path =
                  environment.httpUrl +
                  '/v1/api/file-manager/get-imagepdf/' +
                  image.path;
              });
            }
          })
        )
        .subscribe((response) => {
          this.totalData = response.data.total;
          this.dataActivity = response.data.result;
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

  async searchData(event: any): Promise<void> {
    this.getAllDataUser(event.term);
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

  //update
  async createCommunity(): Promise<void> {
    this.soeService
      .getUserData(this.mform.get('leaderPersonalNumber')?.value)
      .subscribe((data) => {
        const dto: CommunityPublishDTO = {
          name: this.mform.get('name')?.value,
          personalNumber: this.keycloakService.getUsername(),
          location: this.mform.get('location')?.value,
          about: this.mform.get('about')?.value,
          leader: data.personalName,
          leaderPersonalNumber: this.mform.get('leaderPersonalNumber')?.value,
          leaderProfile: this.mform.get('leaderProfile')?.value,
          instagram: this.mform.get('instagram')?.value,
          thumbnailPhotoFile: this.image,
          headlinePhotoFile: this.imageCover,
          leaderUnit: data.personalUnit,
          leaderEmail: data.personalEmail,
          iconFile: this.imageLogo,
          founded: this.mform.get('founded')?.value,
        };
        if (
          this.mform.valid &&
          (this.imageValidator === true || this.imageValidator == null) &&
          (this.imageValidatorCover === true ||
            this.imageValidatorCover == null)
        ) {
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
                this.mform.reset();
                this.getByIdCommunity(this.uuid);
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
            Object.keys(this.mform.controls).forEach((key) => {
              const control = this.mform.get(key);
              if (control?.invalid) {
                control.markAsTouched();
              }
              if (!this.imageCover) {
                this.imageValidatorCover = false;
                this.imageValidatorMessageCover = 'Image is Required';
              }
              if (!this.image) {
                this.imageValidator = false;
                this.imageValidatorMessage = 'Image is Required';
              }
            });
          });
        }
      });
  }

  async getAllDataUser(personalName: string): Promise<void> {
    try {
      this.soeService
        .getUserByName(personalName)
        .pipe(delay(500))
        .subscribe((response) => {
          this.dataUser = response;
        });
    } catch (error) {
      throw error;
    }
  }

  async deleteFollower(): Promise<void> {
    try {
      this.nexcommunityService
        .deleteFollow(this.communityUuidFollow!)
        .subscribe((response) => {
          this.checkFollower(response.personalNumber, response.communityId);
        });
    } catch (error) {
      throw error;
    }
  }

  async createFollower(): Promise<void> {
    try {
      const dto: CreateFollowDTO = {
        communityId: this.communityDetail.id,
        personalNumber: this.keycloakService.getUsername(),
      };
      this.nexcommunityService.createFollow(dto).subscribe((response) => {
        this.checkFollower(response.personalNumber, response.communityId);
      });
    } catch (error) {
      throw error;
    }
  }

  async checkFollower(
    personalNumber: string,
    communityId: number
  ): Promise<void> {
    try {
      this.nexcommunityService
        .checkFollow(personalNumber, communityId)
        .subscribe((response) => {
          if (response.data) {
            this.communityPersonalNumber = response.data.personalNumber;
            this.communityUuidFollow = response.data.uuid;
          } else {
            this.communityPersonalNumber = null;
            this.communityUuidFollow = null;
          }
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

  reset(): void {
    this.mform.reset();
    this.getByIdCommunity(this.uuid);
  }
  show(): void {
    this.getByIdCommunity(this.uuid);
  }
}
