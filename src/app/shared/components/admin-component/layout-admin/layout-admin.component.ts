import { SocketService } from 'src/app/core/utility/socket-io-services/socket.io.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { faBell, faBook, faGear } from '@fortawesome/free-solid-svg-icons';
import { KeycloakService } from 'keycloak-angular';
import { HeaderService } from '../../../../core/services/header/header.service';
import {
  Input,
  Select,
  Sidenav,
  Dropdown,
  Modal,
  Ripple,
  initTE,
} from 'tw-elements';
import { CookieService } from 'ngx-cookie-service';
import { HomePageService } from 'src/app/pages/user/home-page/homepage.service';
import {
  AuthDTO,
  ListRoleDTO,
  UserListDTO,
  signAsDTO,
} from 'src/app/pages/user/home-page/dtos/user-list.dto';
import { NotificationDTO, NotificationReadRequestDTO } from 'src/app/pages/user/home-page/dtos/notification.dto';
import { Subject, takeUntil, tap } from 'rxjs';
import { UserRoleEventService } from 'src/app/core/services/header/user-role-event-service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-layout-admin',
  templateUrl: './layout-admin.component.html',
  styleUrls: ['./layout-admin.component.css'],
})
export class LayoutAdminComponent implements OnInit, OnDestroy {
  faBell = faBell;
  faGear = faGear;
  faBook = faBook;

  page: number = 1;
  limit: number = 20;

  notificationList: NotificationDTO[] = [];
  notificationTotal!: number;

  showNotificationTotal = true;

  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  rolesUser: ListRoleDTO[] = [];

  user: any = {
    personalName: String,
    unit: String,
  };
  personal_number?: string;
  photo!: string;
  photo_default: string =
    'https://st3.depositphotos.com/1767687/16607/v/450/depositphotos_166074422-stock-illustration-default-avatar-profile-icon-grey.jpg';

  constructor(
    private keycloakService: KeycloakService,
    private readonly homepageService: HomePageService,
    private headerService: HeaderService,
    private cookieService: CookieService,
    private readonly SocketService: SocketService,
    private readonly userRoleEventService: UserRoleEventService,
    private readonly router: Router,
    private readonly toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    initTE({ Input, Select, Modal, Dropdown, Ripple, Sidenav });
    this.initializeUserOptions();
    this.getSocket();
    this.getUserData(this.personal_number);
    this.getRoleUser(this.personal_number ?? '');
    this.checkphoto(this.personal_number);
    this.photo =
      'https://talentlead.gmf-aeroasia.co.id/images/avatar/' +
      this.personal_number +
      '.jpg';
  }

  ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.unsubscribe();
  }

  //GET Personal Number from Keycloak
  private initializeUserOptions(): void {
    this.personal_number = this.keycloakService.getUsername();
  }

  //Get Personal Info from SOE
  private getUserData(personal_number: any): void {
    this.headerService.getUserData(personal_number).subscribe((response) => {
      this.user = response.body;
    });
  }

  // Get Websocket
  async getSocket(): Promise<void> {
    try {
      this.SocketService.connectSocket().subscribe(() => {
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
            this.router.navigate(["/user/nex-level/"])
          } else if (
            contentType === "library"
          ) {
            this.router.navigate(["/user/nex-library/"])
          } else if (
            contentType === "learning"
          ) {
            this.router.navigate(["user/nex-learning/"])
          } else if (
            contentType === "community"
          ) {
            this.router.navigate(["/user/nex-community/"])
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

  toggleNotificationTotal() {
    this.showNotificationTotal = false;
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
