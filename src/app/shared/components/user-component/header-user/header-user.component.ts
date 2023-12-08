import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { faBell, faBook, faCircleDot, faTrash } from '@fortawesome/free-solid-svg-icons';
import { KeycloakService } from 'keycloak-angular';
import { Chip, Modal, Collapse, Dropdown, Ripple, initTE } from 'tw-elements';
import { Router } from '@angular/router';
import { HomePageService } from 'src/app/pages/user/home-page/homepage.service';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import {
  AuthDTO,
  InterestDTO,
  ListRoleDTO,
  SkillDTO,
  UserInterestDTO,
  UserListDTO,
  UserListUpdateDTO,
  UserSkillDTO,
  signAsDTO,
} from 'src/app/pages/user/home-page/dtos/user-list.dto';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  Observable,
  Subject,
  Subscription,
  catchError,
  debounceTime,
  map,
  takeUntil,
  tap,
} from 'rxjs';
import { SoeService } from 'src/app/core/soe/soe.service';
import Swal from 'sweetalert2';
import { CookieService } from 'ngx-cookie-service';
import { SocketService } from 'src/app/core/utility/socket-io-services/socket.io.service';
import {
  NotificationDTO,
  NotificationReadRequestDTO,
} from 'src/app/pages/user/home-page/dtos/notification.dto';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { LocalService } from 'src/app/core/services/local/local.service';
import { NotificationService } from 'src/app/pages/user/home-page/services/notification.service';
import { ToastrService } from 'ngx-toastr';
import { UserRoleEventService } from 'src/app/core/services/header/user-role-event-service';

@Component({
  selector: 'app-header-user',
  templateUrl: './header-user.component.html',
  styleUrls: ['./header-user.component.css'],
})
export class HeaderUserComponent
  extends BaseController
  implements OnInit, OnDestroy {
  constructor(
    private readonly router: Router,
    private readonly keycloakService: KeycloakService,
    private readonly homepageService: HomePageService,
    private readonly soeService: SoeService,
    private readonly http: HttpClient,
    private readonly cookieService: CookieService,
    private readonly socketService: SocketService,
    private readonly localService: LocalService,
    private readonly notificationService: NotificationService,
    private readonly toastr: ToastrService,
    private readonly userRoleEventService: UserRoleEventService
  ) {
    super(HeaderUserComponent.name);
  }
  menu: boolean = false;
  logo_nex = '../../../../assets/image/nex-logo.png';
  faBell = faBell;
  faTrash = faTrash;
  faBook = faBook;
  faCircleDot = faCircleDot;

  user: any = {
    personalName: String,
    personalNumber: String,
    personalEmail: String,
    personalUnit: String,

    unit: String,
  };
  personal_number?: string;
  photo!: string;
  photo_default: string =
    'https://st3.depositphotos.com/1767687/16607/v/450/depositphotos_166074422-stock-illustration-default-avatar-profile-icon-grey.jpg';

  page: number = 1;
  limit: number = 20;
  search: string = '';
  sortBy: string = 'desc';

  dataInterest: InterestDTO[] = [];
  dataSkill: SkillDTO[] = [];

  interestUser: UserInterestDTO[] = [];
  skillUser: UserSkillDTO[] = [];

  progressWaitInterest: boolean = false;
  progressWaitSkill: boolean = false;

  notificationList: NotificationDTO[] = [];
  notificationTotal!: number;

  showNotificationTotal = true;

  profileForm: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required]),
    photo: new FormControl(null),
  });

  mform: FormGroup = new FormGroup({
    search: new FormControl(''),
  });

  mformSkill: FormGroup = new FormGroup({
    search: new FormControl(''),
  });

  sosmedForm: FormGroup = new FormGroup({
    instagram: new FormControl('', [Validators.pattern(/^[a-zA-Z0-9.]+$/)]),
    linkedIn: new FormControl('', [Validators.pattern(/^[a-zA-Z0-9.]+$/)]),
    facebook: new FormControl('', [Validators.pattern(/^[a-zA-Z0-9.]+$/)]),
  });

  obs!: Subscription;

  rolesUser: ListRoleDTO[] = [];

  //Photo File Action
  @ViewChild('photoFileInput', { static: false })
  photoFileInput!: ElementRef<HTMLInputElement>;
  selectedPhotoFile: File | null = null;
  photoFileDragging: Boolean = false;
  previewPhotoImage: string = '';

  defaultUserPhoto: File | undefined;
  previewPhotoDefaultUser: string = '';

  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  isUserPhotoValid: boolean = true;

  ngOnInit(): void {
    initTE({ Chip, Modal, Collapse, Dropdown, Ripple });
    this.initializeUserOptions();
    this.getSocket();
    this.getUserData();
    this.getDataInterest(this.page, this.limit, this.search, this.sortBy);
    this.getDataSkill(this.page, this.limit, this.search, this.sortBy);
    this.getRoleUser(this.personal_number ?? '');
    this.photo = '../../../../../assets/image/empty-profile-image.jpeg';

    //Live Search Interest
    this.obs = this.mform.valueChanges
      .pipe(debounceTime(500))
      .subscribe((data) => {
        this.getDataInterest(this.page, this.limit, data.search, this.sortBy);
      });

    //Live Search Skill
    this.obs = this.mformSkill.valueChanges
      .pipe(debounceTime(500))
      .subscribe((data) => {
        this.getDataSkill(this.page, this.limit, data.search, this.sortBy);
      });

    this.getImageAsFile(
      '../../../../../assets/image/empty-profile-image.jpeg'
    ).subscribe((file: File) => {
      this.defaultUserPhoto = file;
    });
  }

  ngOnDestroy(): void {
    this.obs.unsubscribe();

    this._onDestroy$.next(true);
    this._onDestroy$.unsubscribe();
  }

  //GET Personal Number from Keycloak
  private initializeUserOptions(): void {
    this.personal_number = this.keycloakService.getUsername();
  }

  async getSocket(): Promise<void> {
    try {
      this.socketService.connectSocket().subscribe(() => {
        this.getNotification(1, 99);
      });
    } catch (error) {
      throw error;
    }
  }

  // Get Notification
  async getNotification(page: number, limit: number): Promise<void> {
    try {
      this.homepageService
        .getNotificationByPersonalNumber(
          this.keycloakService.getUsername(),
          page,
          limit
        )
        .subscribe(
          (response) => {
            this.notificationList = response.data.result;
            this.notificationTotal = response.data.total;
          },
          (error) => {
            this.notificationList = [];
            this.notificationTotal = 0;
          }
        );
    } catch (error) {
      throw error;
    }
  }

  async readSelectedNotification(uuid: string, contentType: string, contentUuid: string): Promise<void> {
    try {
      const dto: NotificationReadRequestDTO = {
        isRead: true,
      };
      this.homepageService.readNotification(uuid, dto).subscribe(
        () => {
          this.toastr.success(
            'Selected Notification has been readed',
            'Read Notification'
          );
          if (
            contentType === "redeem"
          ) {
            this.router.navigate([`/user/nex-level/`])
          } else if (
            contentType === "ebook"
          ) {
            this.router.navigate([`/user/nex-library/ebook/${contentUuid}`])
          } else if (
            contentType === "album"
          ) {
            this.router.navigate([`/user/nex-library/album/${contentUuid}`])
          } else if (
            contentType === "article"
          ) {
            this.router.navigate(["user/nex-learning/article"])
          } else if (
            contentType === "forum"
          ) {
            this.router.navigate([`/user/nex-talks/forum/comments/${contentUuid}`])
          } else if (
            contentType === "stream"
          ) {
            this.router.navigate([`/user/nex-talks/stream/streaming/${contentUuid}`])
          }
          this.getNotification(
            this.page,
            this.limit,
          );
        },
        (error) => {
          this.toastr.error(
            'Selected notification cannot be readed',
            'Read Notification'
          );
        }
      );
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

  //Get Personal Info from SOE
  async getUserData(): Promise<void> {
    this.homepageService
      .getUserListByPersonalNumber(this.keycloakService.getUsername())
      .pipe(
        tap((data) => {
          if (!data.data) {
            this.photo = '../../../../../assets/image/empty-profile-image.jpeg';
          } else {
            if (data.data.userPhoto !== '') {
              this.photo =
                environment.httpUrl +
                '/v1/api/file-manager/get-imagepdf/' +
                data.data.userPhoto;
            } else {
              this.photo =
                '../../../../../assets/image/empty-profile-image.jpeg';
            }
          }
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe((data) => {
        this.user = data.data;
        if (
          data.data.interestUser.length == 0 &&
          data.data.skillUser.length == 0
        ) {
          this.showModal();
        }
      });
  }

  // Dashboard
  dashboardPage(): void {
    this.router.navigate(['/user/dashboard-user']);
    this.localService.saveData(
      'selected_dashboard_category',
      JSON.stringify({
        name: 'Notifications',
      })
    );
  }

  markAsRead(data: { isRead: boolean }) {
    data.isRead = true;
  }

  toggleNotificationTotal() {
    this.showNotificationTotal = false;
  }

  async showModal(): Promise<void> {
    try {
      const myModalElX = document.getElementById('staticBackdropWelcome');
      const modalWelcome = new Modal(myModalElX);
      this.homepageService
        .getUserListByPersonalNumber(this.keycloakService.getUsername())
        .subscribe((response) => {
          if (
            response.data.skillUser.length === 0 ||
            response.data.interestUser.length === 0
          ) {
            modalWelcome.show();
          }
        });
    } catch (error) {
      throw error;
    }
  }

  //Get Interest
  async getDataInterest(
    page: number,
    limit: number,
    search: string,
    sortBy: string
  ): Promise<void> {
    try {
      this.progressWaitInterest = true;
      this.homepageService
        .getInterest(page, limit, search, sortBy)
        .subscribe(
          (response) => (
            (this.dataInterest = response.data.result),
            (this.progressWaitInterest = false)
          )
        );
    } catch (error) {
      throw error;
    }
  }

  //Get Skill
  async getDataSkill(
    page: number,
    limit: number,
    search: string,
    sortBy: string
  ): Promise<void> {
    try {
      this.progressWaitSkill = true;
      this.homepageService
        .getSkill(page, limit, search, sortBy)
        .subscribe(
          (response) => (
            (this.dataSkill = response.data.result),
            (this.progressWaitSkill = false)
          )
        );
    } catch (error) {
      throw error;
    }
  }

  selectInterest(data: InterestDTO): void {
    const existingIndex = this.interestUser.findIndex(
      (item) => item.interestId === data.id
    );
    if (existingIndex !== -1) {
      this.interestUser.splice(existingIndex, 1);
    } else {
      const newInterest: UserInterestDTO = {
        personalNumber: this.keycloakService.getUsername(),
        interestId: data.id,
        name: data.name,
      };
      this.interestUser.push(newInterest);
    }
  }

  isCheckedInterest(data: InterestDTO): boolean {
    return this.interestUser.some((item) => item.interestId === data.id);
  }

  selectSkill(data: SkillDTO): void {
    const existingIndex = this.skillUser.findIndex(
      (item) => item.skillId === data.id
    );
    if (existingIndex !== -1) {
      this.skillUser.splice(existingIndex, 1);
    } else {
      const newInterest: UserSkillDTO = {
        personalNumber: this.keycloakService.getUsername(),
        skillId: data.id,
        name: data.name,
      };
      this.skillUser.push(newInterest);
    }
  }

  isCheckedSkill(data: SkillDTO): boolean {
    return this.skillUser.some((item) => item.skillId === data.id);
  }

  async submitDataUser(): Promise<void> {
    try {
      this.soeService
        .getUserData(this.keycloakService.getUsername())
        .subscribe(async (response) => {
          const dto: UserListUpdateDTO = {
            userName: this.profileForm.get('username')?.value,
            userPhoto: this.profileForm.get('photo')?.value,
            personalNumber: response.personalNumber,
            personalName: response.personalName,
            personalTitle: response.personalTitle,
            personalUnit: response.personalUnit,
            personalBirthPlace: response.personalBirthPlace,
            personalBirthDate: response.personalBirthDate,
            personalGrade: response.personalGrade,
            personalJobDesc: null,
            personalEmail: response.personalEmail,
            personalImage: response.personalImage,
            instagram:
              this.sosmedForm.get('instagram')?.value == ''
                ? null
                : this.sosmedForm.get('instagram')?.value,
            linkedIn:
              this.sosmedForm.get('linkedIn')?.value == ''
                ? null
                : this.sosmedForm.get('linkedIn')?.value,
            facebook:
              this.sosmedForm.get('facebook')?.value == ''
                ? null
                : this.sosmedForm.get('facebook')?.value,
          };

          const formData = new FormData();
          formData.append('userName', this.profileForm.get('username')?.value);
          formData.append(
            'userPhoto',
            this.profileForm.get('photo')?.value ?? this.defaultUserPhoto
          );
          formData.append('personalNumber', response.personalNumber);
          formData.append('personalName', response.personalName);
          formData.append('personalTitle', response.personalTitle);
          formData.append('personalUnit', response.personalUnit);
          formData.append('personalBirthPlace', response.personalBirthPlace);
          formData.append('personalBirthDate', response.personalBirthDate);
          formData.append('personalGrade', response.personalGrade ?? '');
          formData.append('personalJobDesc', response.personalJobDesc ?? '');
          formData.append('personalEmail', response.personalEmail);
          formData.append('personalImage', response.personalImage);
          formData.append(
            'instagram',
            this.sosmedForm.get('instagram')?.value === ''
              ? null
              : this.sosmedForm.get('instagram')?.value
          );
          formData.append(
            'linkedIn',
            this.sosmedForm.get('linkedIn')?.value === ''
              ? null
              : this.sosmedForm.get('linkedIn')?.value
          );
          formData.append(
            'facebook',
            this.sosmedForm.get('facebook')?.value === ''
              ? null
              : this.sosmedForm.get('facebook')?.value
          );

          this.homepageService
            .updateUserList(this.keycloakService.getUsername(), formData)
            .pipe(
              tap(async () => {
                try {
                  this.skillUser.forEach((data) =>
                    this.homepageService.createUserSkill(data).subscribe()
                  );
                } catch (error) {
                  throw error;
                }
              }),
              tap(async () => {
                try {
                  this.interestUser.forEach((data) =>
                    this.homepageService.createUserInterest(data).subscribe()
                  );
                } catch (error) {
                  throw error;
                }
              })
            )
            .subscribe(() => {
              this.getUserData().then(() => {
                Swal.fire({
                  icon: 'success',
                  title: 'Thank You!',
                  text: 'Have a nice day!.',
                  timer: 1000,
                  showConfirmButton: false,
                });
              });
            });
        });
    } catch (error) {
      throw error;
    }
  }

  //change role
  async changeRole(): Promise<void> {
    try {
      const signAs: signAsDTO = {
        signAs: null,
      };
      this.homepageService
        .signAs(this.keycloakService.getUsername(), signAs)
        .subscribe(() => {
          this.checkUser();
        });
    } catch (error) {
      throw error;
    }
  }

  //Log out
  async logout(): Promise<void> {
    try {
      const signAs: signAsDTO = {
        signAs: null,
      };
      // this.homepageService
      //   .destroyToken(this.cookieService.get('TOKEN_BACKEND'))
      //   .subscribe(() => {});
      this.homepageService
        .signAs(this.keycloakService.getUsername(), signAs)
        .subscribe(() => {
          this.keycloakService
            .logout()
            .then(() => this.keycloakService.clearToken());
        });
    } catch (error) {
      throw error;
    }
  }

  onPhotoDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.photoFileDragging = true;
  }

  onPhotoDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.photoFileDragging = false;
  }

  onPhotoDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.photoFileDragging = false;

    const file = event.dataTransfer?.files[0];
    if (file) {
      if (this.isImageFile(file)) {
        this.readPhotoFile(file);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Wrong File',
          text: 'Please select only image file!',
        });
      }
    }
    this.profileForm.controls['photo'].markAsTouched();
  }

  onPhotoUploaded(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (file) {
      if (this.isImageFile(file)) {
        this.readPhotoFile(file);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Wrong File',
          text: 'Please select only image file!',
        });
      }
    }
    this.profileForm.controls['photo'].markAsTouched();
    fileInput.value = '';
  }

  isImageFile(file: File): boolean {
    const acceptedImageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    return file && acceptedImageTypes.includes(file.type);
  }

  readPhotoFile(file: File): void {
    this.selectedPhotoFile = file;
    this.profileForm.controls['photo'].setValue(file);
    this.checkValidationUserPhotoSize(file.size);
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      this.previewPhotoImage = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  onRemovePhoto(): void {
    this.selectedPhotoFile = null;
    this.previewPhotoImage = '';
    this.profileForm.controls['photo'].setValue(null);
  }

  triggerPhotoFileInputClick(): void {
    if (this.photoFileInput) {
      this.photoFileInput.nativeElement.click();
      this.profileForm.controls['photo'].markAsTouched();
    }
  }

  getImageAsFile(imagePath: string): Observable<File> {
    return this.http.get(imagePath, { responseType: 'blob' }).pipe(
      map((blob: Blob) => {
        const fileName = imagePath.substring(imagePath.lastIndexOf('/') + 1);

        const fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1);

        let fileType = '';
        if (fileExtension === 'jpg' || fileExtension === 'jpeg') {
          fileType = 'image/jpeg';
        } else if (fileExtension === 'png') {
          fileType = 'image/png';
        } else {
          fileType = 'image/*';
        }

        const file = new File([blob], fileName, { type: fileType });

        return file;
      }),
      catchError((error: any) => {
        console.error('Error fetching the image:', error);
        throw error;
      })
    );
  }

  checkValidationUserPhotoSize(size: number): void {
    this.isUserPhotoValid = size <= 1000000; // 1 MB = 1,000,000 bytes
  }

  async checkUser(): Promise<void> {
    try {
      this.homepageService
        .getUserListByPersonalNumber(this.keycloakService.getUsername())
        .pipe(
          tap((data) => {
            if (data.data) {
              const genToken: AuthDTO = {
                personalNumber: data.data.personalNumber,
                personalEmail: data.data.personalEmail!,
              };
              this.generateToken(genToken);
            }
          }),
          takeUntil(this._onDestroy$)
        )
        .subscribe((data) => {
          this.loadDataUser(data.data);
        });
    } catch (error) {
      throw error;
    }
  }

  loadDataUser(data: UserListDTO): void {
    if (data) {
      if (data.roleUser.length > 1) {
        if (!data.signAs) {
          this.router.navigate(['']);
          this.userRoleEventService.emitRoleSelectedEvent(null);
        }
      }
    }
  }

  async getRoleUser(personalNumber: string): Promise<void> {
    try {
      this.homepageService
        .getUserListByPersonalNumber(personalNumber)
        .subscribe((response) => {
          if (response.data) {
            this.rolesUser = response.data.roleUser;
          }
        });
    } catch (error) {
      throw error;
    }
  }

  async generateToken(dto: AuthDTO): Promise<void> {
    try {
      this.homepageService.tokenGenerate(dto).subscribe();
    } catch (error) {
      throw error;
    }
  }
}
