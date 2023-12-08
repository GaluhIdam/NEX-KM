import { Component, Inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { Observable, Subject, catchError, map, of, tap, takeUntil } from 'rxjs';
import { Dropdown, Collapse, Ripple, initTE } from 'tw-elements';
import { NexLevelService } from './pages/user/nex-level/nex-level.service';
import { SoeService } from './core/soe/soe.service';
import {
  LoginDTO,
  PointCreateDTO,
} from './pages/user/nex-level/dtos/point.dto';
import { HomePageService } from './pages/user/home-page/homepage.service';
import {
  AuthDTO,
  ListRoleDTO,
  UserListDTO,
  UserListUpdateDTO,
  signAsDTO,
} from './pages/user/home-page/dtos/user-list.dto';
import { CookieService } from 'ngx-cookie-service';
import { faUserGear } from '@fortawesome/free-solid-svg-icons';
import { UserInRoleCreateDTO } from './pages/user/home-page/dtos/role-permission.dto';
import { HttpClient } from '@angular/common/http';
import { UserRoleEventService } from './core/services/header/user-role-event-service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  title: any;
  personal_number?: string;

  user: any = {
    personalName: String,
    unit: String,
  };

  //Checking is Admin or User
  currentUrl!: string;
  isLoading: Boolean;
  faUserGear = faUserGear;
  select!: string | null;
  roleSelected!: string | null;
  rolesUser: ListRoleDTO[] = [];

  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  constructor(
    private readonly router: Router,
    public readonly keycloakService: KeycloakService,
    private readonly nexlevelservice: NexLevelService,
    private readonly homepageService: HomePageService,
    private readonly soeservice: SoeService,
    private readonly http: HttpClient,
    public cookieService: CookieService,
    private readonly userRoleEventService: UserRoleEventService
  ) {
    this.isLoading = false;
  }

  userData!: UserListDTO;
  genToken!: AuthDTO;

  ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.unsubscribe();
  }

  ngOnInit(): void {
    initTE({ Dropdown, Ripple, Collapse });
    this.checkUser();
    this.currentUrl = window.location.href;

    this.userRoleEventService
      .roleSelectedEventListener()
      .subscribe((userRole) => {
        this.roleSelected = userRole;
      });
  }

  getChild(activatedRoute: ActivatedRoute): any {
    if (activatedRoute.firstChild) {
      return this.getChild(activatedRoute.firstChild);
    } else {
      return activatedRoute;
    }
  }

  async checkUser(): Promise<void> {
    try {
      if (await this.keycloakService.isLoggedIn()) {
        this.homepageService
          .getUserListByPersonalNumber(this.keycloakService.getUsername())
          .pipe(
            tap((data) => {
              if (!data.data) {
                this.soeservice
                  .getUserData(this.keycloakService.getUsername())
                  .subscribe((dataUsr) => {
                    this.getDefaultImage().subscribe((filePhoto) => {
                      const dto: UserListUpdateDTO = {
                        userName: dataUsr.personalName,
                        userPhoto: filePhoto,
                        personalNumber: dataUsr.personalNumber,
                        personalName: dataUsr.personalName,
                        personalTitle: dataUsr.personalTitle,
                        personalUnit: dataUsr.personalUnit,
                        personalBirthPlace: dataUsr.personalBirthPlace,
                        personalBirthDate: dataUsr.personalBirthDate,
                        personalGrade: dataUsr.personalGrade,
                        personalJobDesc: dataUsr.personalJobDesc,
                        personalEmail: dataUsr.personalEmail,
                        personalImage: dataUsr.personalImage,
                        instagram: null,
                        linkedIn: null,
                        facebook: null,
                      };

                      const formData = new FormData();
                      formData.append('userName', dataUsr.personalName);
                      formData.append('userPhoto', filePhoto);
                      formData.append('personalNumber', dataUsr.personalNumber);
                      formData.append('personalName', dataUsr.personalName);
                      formData.append('personalTitle', dataUsr.personalTitle);
                      formData.append('personalUnit', dataUsr.personalUnit);
                      formData.append(
                        'personalBirthPlace',
                        dataUsr.personalBirthPlace
                      );
                      formData.append(
                        'personalBirthDate',
                        dataUsr.personalBirthDate
                      );
                      formData.append(
                        'personalGrade',
                        dataUsr.personalGrade ?? ''
                      );
                      formData.append(
                        'personalJobDesc',
                        dataUsr.personalJobDesc ?? ''
                      );
                      formData.append('personalEmail', dataUsr.personalEmail);

                      formData.append('personalImage', dataUsr.personalImage);
                      formData.append('instagram', '');
                      formData.append('linkedIn', '');
                      formData.append('facebook', '');

                      this.homepageService
                        .createUserList(formData)
                        .subscribe((x) => {
                          const dta: UserInRoleCreateDTO = {
                            roleId: 2,
                            userId: x.data.id,
                          };
                          this.homepageService
                            .createUserInRole(dta)
                            .subscribe(() =>
                              this.homepageService
                                .getUserListByPersonalNumber(dto.personalNumber)
                                .pipe(
                                  tap((res) => {
                                    const dataPoint: PointCreateDTO = {
                                      personalNumber: res.data.personalNumber,
                                      personalName: res.data.personalName,
                                      personalUnit: res.data.personalUnit,
                                      title: res.data.personalTitle!,
                                      personalEmail: res.data.personalEmail!,
                                      point: 0,
                                      totalPoint: 0,
                                    };
                                    this.checkPoint(dataPoint);
                                  }),
                                  tap((res) => {
                                    const genToken: AuthDTO = {
                                      personalNumber: res.data.personalNumber,
                                      personalEmail: res.data.personalEmail!,
                                    };
                                    this.generateToken(genToken);
                                    this.loginPoint();
                                  }),
                                  tap((res) => {
                                    if (res.data.roleUser.length > 1) {
                                      if (!res.data.signAs) {
                                        this.router.navigate(['']);
                                        this.isLoading = true;
                                      } else if (
                                        res.data.signAs == 'ADMIN' &&
                                        this.currentUrl
                                          .split('://')[1]
                                          .split('/')
                                          .slice(1)[0] != 'admin'
                                      ) {
                                        this.router.navigate(['admin']);
                                        this.isLoading = true;
                                      } else if (
                                        res.data.signAs == 'USER' &&
                                        this.currentUrl
                                          .split('://')[1]
                                          .split('/')
                                          .slice(1)[0] != 'user'
                                      ) {
                                        this.router.navigate(['user']);
                                        this.isLoading = true;
                                      }
                                    }
                                    if (res.data.roleUser.length === 1) {
                                      const signAs: signAsDTO = {
                                        signAs:
                                          res.data.roleUser[0].listRole.page,
                                      };
                                      if (
                                        res.data.roleUser[0].listRole.page ==
                                          'ADMIN' &&
                                        this.currentUrl
                                          .split('://')[1]
                                          .split('/')
                                          .slice(1)[0] != 'admin'
                                      ) {
                                        this.roleSelected = 'ADMIN';
                                        this.homepageService
                                          .signAs(
                                            this.keycloakService.getUsername(),
                                            signAs
                                          )
                                          .subscribe(() => {
                                            this.router.navigate(['admin']);
                                          });
                                      }
                                      if (
                                        res.data.roleUser[0].listRole.page ==
                                          'USER' &&
                                        this.currentUrl
                                          .split('://')[1]
                                          .split('/')
                                          .slice(1)[0] != 'user'
                                      ) {
                                        this.roleSelected = 'USER';
                                        this.homepageService
                                          .signAs(
                                            this.keycloakService.getUsername(),
                                            signAs
                                          )
                                          .subscribe(() => {
                                            this.router.navigate(['user']);
                                          });
                                      }
                                    }
                                  }),
                                  takeUntil(this._onDestroy$)
                                )
                                .subscribe((data) => {
                                  this.loadDataUser(data.data);
                                })
                            );
                        });
                    });
                  });
              }
            }),
            tap((data) => {
              if (data.data) {
                const dataPoint: PointCreateDTO = {
                  personalNumber: data.data.personalNumber,
                  personalName: data.data.personalName,
                  personalUnit: data.data.personalUnit,
                  title: data.data.personalTitle!,
                  personalEmail: data.data.personalEmail!,
                  point: 0,
                  totalPoint: 0,
                };
                this.checkPoint(dataPoint);
              }
            }),
            tap((data) => {
              if (data.data) {
                const genToken: AuthDTO = {
                  personalNumber: data.data.personalNumber,
                  personalEmail: data.data.personalEmail!,
                };
                this.generateToken(genToken);
                this.loginPoint();
              }
            }),
            takeUntil(this._onDestroy$)
          )
          .subscribe((data) => {
            this.loadDataUser(data.data);
          });
      }
      return;
    } catch (error) {
      throw error;
    }
  }

  loadDataUser(data: UserListDTO): void {
    if (data) {
      this.getRoleUser(this.keycloakService.getUsername());
      if (data.roleUser.length > 1) {
        if (!data.signAs) {
          this.router.navigate(['']);
          this.roleSelected = null;
          this.isLoading = true;
        }

        // Admin Condition
        if (
          data.signAs == 'ADMIN' &&
          this.currentUrl.split('://')[1].split('/').slice(1)[0] != 'admin'
        ) {
          this.router.navigate(['admin']);
          this.roleSelected = 'ADMIN';
          this.isLoading = true;
        }
        if (
          data.signAs == 'ADMIN' &&
          this.currentUrl.split('://')[1].split('/').slice(1)[0] == 'admin'
        ) {
          this.roleSelected = 'ADMIN';
          this.isLoading = true;
        }

        // User Condition
        if (
          data.signAs == 'USER' &&
          this.currentUrl.split('://')[1].split('/').slice(1)[0] != 'user'
        ) {
          this.router.navigate(['user']);
          this.roleSelected = 'USER';
          this.isLoading = true;
        }
        if (
          data.signAs == 'USER' &&
          this.currentUrl.split('://')[1].split('/').slice(1)[0] == 'user'
        ) {
          this.roleSelected = 'USER';
          this.isLoading = true;
        }
      }
      if (data.roleUser.length === 1) {
        const signAs: signAsDTO = {
          signAs: data.roleUser[0].listRole.page,
        };
        this.roleSelected = data.roleUser[0].listRole.page;
        if (
          data.roleUser[0].listRole.page == 'ADMIN' &&
          this.currentUrl.split('://')[1].split('/').slice(1)[0] != 'admin'
        ) {
          this.roleSelected = 'ADMIN';
          this.homepageService
            .signAs(this.keycloakService.getUsername(), signAs)
            .subscribe(() => {
              this.router.navigate(['admin']);
            });
        }
        if (
          data.roleUser[0].listRole.page == 'USER' &&
          this.currentUrl.split('://')[1].split('/').slice(1)[0] != 'user'
        ) {
          this.roleSelected = 'USER';
          this.homepageService
            .signAs(this.keycloakService.getUsername(), signAs)
            .subscribe(() => {
              this.router.navigate(['user']);
            });
        }
      }
    }
    this.isLoading = true;
  }

  async checkPoint(dto: PointCreateDTO): Promise<void> {
    try {
      this.nexlevelservice
        .getPointByPersonalNumber(this.keycloakService.getUsername())
        .subscribe((response) => {
          if (!response.data) {
            this.nexlevelservice.createPoint(dto).subscribe();
          }
          return;
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

  async loginPoint(): Promise<void> {
    try {
      const dtox: LoginDTO = {
        personalNumber: this.keycloakService.getUsername(),
      };
      this.nexlevelservice.loginPoint(dtox).subscribe();
    } catch (error) {
      throw error;
    }
  }

  selectRoles(roles: string): void {
    this.select = roles;
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

  async continuePage(): Promise<void> {
    try {
      const signAs: signAsDTO = {
        signAs: this.select,
      };
      this.homepageService
        .signAs(this.keycloakService.getUsername(), signAs)
        .subscribe(() => {
          this.roleSelected = this.select;
          if (this.select == 'ADMIN') {
            this.router.navigate(['admin']);
          }
          if (this.select == 'USER') {
            this.router.navigate(['user']);
          }
        });
    } catch (error) {
      throw error;
    }
  }

  private getDefaultImage(): Observable<File> {
    return this.http
      .get('../../../../../assets/image/empty-profile-image.jpeg', {
        responseType: 'blob',
      })
      .pipe(
        map((blob: Blob) => {
          const fileName =
            '../../../../../assets/image/empty-profile-image.jpeg'.substring(
              '../../../../../assets/image/empty-profile-image.jpeg'.lastIndexOf(
                '/'
              ) + 1
            );

          const fileExtension = fileName.substring(
            fileName.lastIndexOf('.') + 1
          );

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
}
