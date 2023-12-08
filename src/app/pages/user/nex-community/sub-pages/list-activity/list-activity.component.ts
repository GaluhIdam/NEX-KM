import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  faUsers,
  faLocationPin,
  faCalendar,
  faChevronRight,
  faPlus,
  faArrowRight,
  faPencil,
  faCircleChevronLeft,
  faCircleChevronRight,
  faEye,
  faImage,
} from '@fortawesome/free-solid-svg-icons';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import { NexCommunityService } from '../../nex-community.service';
import { KeycloakService } from 'keycloak-angular';
import { SoeService } from 'src/app/core/soe/soe.service';
import {
  CommunityDTO,
  RecentActivityCreateDTO,
  RecentActivityDTO,
} from '../../dto/community.dto';
import Swal from 'sweetalert2';
import { Select, Modal, initTE } from 'tw-elements';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NexLearningService } from '../../../nex-learning/nex-learning.service';
import { Subscription, debounceTime, tap } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-list-activity',
  templateUrl: './list-activity.component.html',
  styleUrls: ['./list-activity.component.css'],
})
export class ListActivityComponent
  extends BaseController
  implements OnInit, OnDestroy
{
  constructor(
    private readonly router: Router,
    private readonly activeRoute: ActivatedRoute,
    private readonly nexcommunityService: NexCommunityService,
    private readonly nexlearningService: NexLearningService,
    readonly keycloakService: KeycloakService,
    private readonly soeService: SoeService
  ) {
    super(ListActivityComponent.name);
  }

  bg_community =
    '../../../../assets/image/community/headline/basketball-headline.jpg';

  faUsers = faUsers;
  faLocationPin = faLocationPin;
  faCalendar = faCalendar;
  faChevronRight = faChevronRight;
  faArrowRight = faArrowRight;
  faPlus = faPlus;
  faPencil = faPencil;
  faCircleChevronLeft = faCircleChevronLeft;
  faCircleChevronRight = faCircleChevronRight;
  faEye = faEye;
  faImage = faImage;

  image!: File;
  imageShow!: string;
  imageValidator: boolean | null = null;
  imageValidatorMessage!: string;

  dataActivity: Array<RecentActivityDTO> = [];
  page: number = 1;
  limit: number = 10;
  search: string = '';
  sortBy: string = 'createdAtDESC';
  totalData: number = 0;
  pageData: Array<number> = [];

  obs!: Subscription;

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
    founded: new Date()
  };

  uuid!: string;
  uuidEdit!: string;
  email!: string;
  photo!: string;

  communityId!: number;

  mform: FormGroup = new FormGroup({
    title: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
  });

  mformPaginate: FormGroup = new FormGroup({
    search: new FormControl(this.search),
    page: new FormControl(this.page),
    limit: new FormControl(this.limit),
    sortBy: new FormControl(this.sortBy),
  });

  ngOnDestroy(): void {
    this.obs.unsubscribe();
  }
  ngDoCheck(): void {
    initTE({ Select, Modal });
  }
  ngOnInit(): void {
    this.activeRoute.params.subscribe((params: Params) => {
      const uuid = params['uuid'];
      this.uuid = params['uuid'];
      this.getByIdCommunity(uuid);
    });
    this.obs = this.mformPaginate.valueChanges
      .pipe(debounceTime(500))
      .subscribe((data) => {
        if (data.page < 1) {
          data.page < 1
            ? this.mformPaginate.get('page')?.setValue(1)
            : data.page;
        } else {
          this.getDataActivity(
            data.page,
            data.limit,
            data.search,
            data.sortBy,
            this.communityId
          );
        }
      });
  }

  addRecentActivity(): void {
    this.router.navigate(['/nex-community/add-recent-activity']);
  }

  viewActivity(): void {
    this.router.navigate(['/nex-community/view-activity']);
  }

  //Get Data Communuty
  async getByIdCommunity(uuid: string): Promise<void> {
    try {
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
            }
          })
        )
        .subscribe((response) => {
          this.communityDetail = response.data;
          this.communityId = response.data.id;
          this.getDataActivity(
            this.page,
            this.limit,
            this.search,
            this.sortBy,
            response.data.id
          );
          this.soeService
            .getUserData(response.data.leaderPersonalNumber)
            .subscribe((data) => {
              this.email = data.personalEmail;
            });
          this.checkphoto(response.data.leaderPersonalNumber);
        });
    } catch (error) {
      throw error;
    }
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

  //Create Data Activity
  async postDataActivity(): Promise<void> {
    try {
      if (this.mform.valid && this.imageValidator) {
        this.soeService
          .getUserData(this.keycloakService.getUsername())
          .subscribe((data) => {
            const dto: RecentActivityCreateDTO = {
              communityId: this.communityDetail.id,
              title: this.mform.get('title')?.value,
              description: this.mform.get('description')?.value,
              personalNumber: this.keycloakService.getUsername(),
              photo: this.image,
              personalName: data.personalName,
            };
            this.nexcommunityService.createActivity(dto).subscribe(() => {
              Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Your activity was successfully created.',
                timer: 1000,
                showConfirmButton: false,
              }).then(() => {
                this.mform.reset();
                this.getDataActivity(
                  this.page,
                  this.limit,
                  this.search,
                  this.sortBy,
                  this.communityId
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

  async editActivity(
    image: string,
    title: string,
    description: string,
    uuid: string
  ): Promise<void> {
    this.imageValidator = true;
    this.uuidEdit = uuid;
    this.nexlearningService.getImageFromUrl(image).subscribe((file) => {
      this.image = file;
      this.imageShow = image;
      this.mform.get('title')?.setValue(title);
      this.mform.get('description')?.setValue(description);
    });
  }

  //Reset Form
  resetForm(): void {
    this.imageValidator = null;
    this.imageShow = '';
    this.mform.reset();
  }

  //Update Form
  async updateActivityData(): Promise<void> {
    try {
      if (this.mform.valid && this.imageValidator) {
        this.soeService
          .getUserData(this.keycloakService.getUsername())
          .subscribe(async (res) => {
            const dto: RecentActivityCreateDTO = {
              communityId: this.communityDetail.id,
              title: this.mform.get('title')?.value,
              description: this.mform.get('description')?.value,
              personalNumber: this.keycloakService.getUsername(),
              photo: this.image,
              personalName: res.personalName,
            };
            this.nexcommunityService
              .updateActivity(this.uuidEdit, dto)
              .subscribe(() => {
                Swal.fire({
                  icon: 'success',
                  title: 'Success!',
                  text: 'Your activity was successfully updated.',
                  timer: 1000,
                  showConfirmButton: false,
                }).then(() => {
                  this.mform.reset();
                  this.getDataActivity(
                    this.page,
                    this.limit,
                    this.search,
                    this.sortBy,
                    this.communityId
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

  nextPage(): void {
    if (this.pageData.length > 1) {
      this.mformPaginate
        .get('page')
        ?.setValue(this.mformPaginate.get('page')?.value + 1);
    }
  }

  prevPage(): void {
    if (this.pageData.length > 1) {
      this.mformPaginate
        .get('page')
        ?.setValue(this.mformPaginate.get('page')?.value - 1);
    }
  }
}
