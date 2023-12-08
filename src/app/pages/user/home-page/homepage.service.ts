import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, tap } from 'rxjs';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import {
  ResponseArrayDTO,
  ResponseObjectDTO,
} from 'src/app/core/dtos/response.dto';
import { environment } from 'src/environments/environment.prod';
import {
  SharingCreateDTO,
  SharingDTO,
  SharingExpStatusDTO,
} from './dtos/sharing.dto';
import { SliderCreateDTO, SliderDTO } from './dtos/sliders.dto';
import {
  InterestSkillCreateDTO,
  InterestSkillDTO,
} from './dtos/interest-skill.dto';
import {
  AuthDTO,
  UserInterestDTO,
  UserListDTO,
  UserSkillDTO,
  signAsDTO,
} from './dtos/user-list.dto';
import {
  MasterPermissionDTO,
  RolePermissionCreateDTO,
  RolePermissionDTO,
  UserInRoleCreateDTO,
  UserInRoleDTO,
} from './dtos/role-permission.dto';
import {
  NotificationDTO,
  NotificationReadRequestDTO,
  NotificationRequestDTO,
} from './dtos/notification.dto';
import {
  CreateFollowerFollowingDTO,
  FollowerFollowingDTO,
  MergeFollowDTO,
} from '../dashboard-user/dtos/follower-following.dto';
import { SoeService } from 'src/app/core/soe/soe.service';
import { ForYourPageDTO } from './dtos/for-your-page.dto';
import {
  CommunityDTO,
  CommunityUserDTO,
  RecentActivityDTO,
} from '../nex-community/dto/community.dto';

@Injectable({
  providedIn: 'root',
})
export class HomePageService extends BaseController {
  constructor(
    private http: HttpClient,
    private readonly soeService: SoeService
  ) {
    super(HomePageService.name);
  }

  //Slide
  getSliderByUuid(uuid: string): Observable<ResponseObjectDTO<SliderDTO>> {
    return this.http
      .get<ResponseObjectDTO<SliderDTO>>(
        environment.httpUrl + '/v1/api/sliders/' + uuid
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  getSliders(
    page: number,
    limit: number,
    search: string,
    sortBy: string,
    isAdmin: boolean
  ): Observable<ResponseArrayDTO<SliderDTO[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('search', search)
      .set('sortBy', sortBy)
      .set('isAdmin', isAdmin);
    return this.http
      .get<ResponseArrayDTO<SliderDTO[]>>(
        environment.httpUrl + '/v1/api/' + 'sliders',
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  createSlider(dto: SliderCreateDTO): Observable<ResponseObjectDTO<SliderDTO>> {
    const formData = new FormData();
    formData.append('image', dto.image);
    formData.append('personalNumber', `${dto.personalNumber}`);
    formData.append('title', `${dto.title}`);
    formData.append('description', `${dto.description}`);
    formData.append('sequence', `${dto.sequence}`);
    formData.append('uploadedBy', `${dto.uploadedBy}`);
    formData.append('status', `${dto.status}`);
    return this.http
      .post<ResponseObjectDTO<SliderDTO>>(
        environment.httpUrl + '/v1/api/' + 'sliders',
        formData
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  updateSlider(
    uuid: string,
    dto: SliderCreateDTO
  ): Observable<ResponseObjectDTO<SliderDTO>> {
    const formData = new FormData();
    formData.append('image', dto.image);
    formData.append('personalNumber', `${dto.personalNumber}`);
    formData.append('title', `${dto.title}`);
    formData.append('description', `${dto.description}`);
    formData.append('sequence', `${dto.sequence}`);
    formData.append('uploadedBy', `${dto.uploadedBy}`);
    formData.append('status', `${dto.status}`);
    return this.http
      .put<ResponseObjectDTO<SliderDTO>>(
        environment.httpUrl + '/v1/api/' + 'sliders/' + uuid,
        formData
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  deleteSlider(uuid: string): Observable<ResponseObjectDTO<SliderDTO>> {
    return this.http
      .delete<ResponseObjectDTO<SliderDTO>>(
        environment.httpUrl + '/v1/api/' + 'sliders/' + uuid
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Sharing-experience
  getSharingExp(
    page: number,
    limit: number,
    search: string,
    sortBy: string,
    isAdmin: boolean,
    personalNumber?: string
  ): Observable<ResponseArrayDTO<SharingDTO[]>> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('search', search)
      .set('sortBy', sortBy)
      .set('isAdmin', isAdmin);

    if (personalNumber) {
      params = params.set('personalNumber', personalNumber);
    }
    return this.http
      .get<ResponseArrayDTO<SharingDTO[]>>(
        environment.httpUrl + '/v1/api/' + 'sharing-exp/',
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  getSharingExpByUuid(uuid: string): Observable<ResponseObjectDTO<SharingDTO>> {
    return this.http
      .get<ResponseObjectDTO<SharingDTO>>(
        environment.httpUrl + '/v1/api/' + 'sharing-exp/' + uuid
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  createSharingExp(
    dto: SharingCreateDTO
  ): Observable<ResponseObjectDTO<SharingDTO>> {
    return this.http
      .post<ResponseObjectDTO<SharingDTO>>(
        environment.httpUrl + '/v1/api/' + 'sharing-exp',
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  updateSharingExp(
    uuid: string,
    dto: SharingCreateDTO
  ): Observable<ResponseObjectDTO<SharingDTO>> {
    return this.http
      .put<ResponseObjectDTO<SharingDTO>>(
        environment.httpUrl + '/v1/api/' + 'sharing-exp/' + uuid,
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  deleteSharingExp(uuid: string): Observable<ResponseObjectDTO<SharingDTO>> {
    return this.http
      .delete<ResponseObjectDTO<SharingDTO>>(
        environment.httpUrl + '/v1/api/' + 'sharing-exp/' + uuid
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  approveReject(
    uuid: string,
    dto: SharingExpStatusDTO
  ): Observable<ResponseObjectDTO<SharingDTO>> {
    return this.http
      .put<ResponseObjectDTO<SharingDTO>>(
        environment.httpUrl + '/v1/api/' + 'sharing-exp/approve-reject/' + uuid,
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Interest
  getInterest(
    page: number,
    limit: number,
    search: string,
    sortBy: string
  ): Observable<ResponseArrayDTO<InterestSkillDTO[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('search', search)
      .set('sortBy', sortBy);
    return this.http
      .get<ResponseArrayDTO<InterestSkillDTO[]>>(
        environment.httpUrl + '/v1/api/' + 'interest',
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  getInterestByUuid(
    uuid: string
  ): Observable<ResponseObjectDTO<InterestSkillDTO>> {
    return this.http
      .get<ResponseObjectDTO<InterestSkillDTO>>(
        environment.httpUrl + '/v1/api/' + 'interest/' + uuid
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  createInterest(
    dto: InterestSkillCreateDTO
  ): Observable<ResponseObjectDTO<InterestSkillDTO>> {
    return this.http
      .post<ResponseObjectDTO<InterestSkillDTO>>(
        environment.httpUrl + '/v1/api/' + 'interest',
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  updateInterest(
    uuid: string,
    dto: InterestSkillCreateDTO
  ): Observable<ResponseObjectDTO<InterestSkillDTO>> {
    return this.http
      .put<ResponseObjectDTO<InterestSkillDTO>>(
        environment.httpUrl + '/v1/api/' + 'interest/' + uuid,
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  deleteInterest(
    uuid: string
  ): Observable<ResponseObjectDTO<InterestSkillDTO>> {
    return this.http
      .delete<ResponseObjectDTO<InterestSkillDTO>>(
        environment.httpUrl + '/v1/api/' + 'interest/' + uuid
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Skill
  getSkill(
    page: number,
    limit: number,
    search: string,
    sortBy: string
  ): Observable<ResponseArrayDTO<InterestSkillDTO[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('search', search)
      .set('sortBy', sortBy);
    return this.http
      .get<ResponseArrayDTO<InterestSkillDTO[]>>(
        environment.httpUrl + '/v1/api/' + 'skill',
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  createSkill(
    dto: InterestSkillCreateDTO
  ): Observable<ResponseObjectDTO<InterestSkillDTO>> {
    return this.http
      .post<ResponseObjectDTO<InterestSkillDTO>>(
        environment.httpUrl + '/v1/api/' + 'skill',
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  updateSkill(
    uuid: string,
    dto: InterestSkillCreateDTO
  ): Observable<ResponseObjectDTO<InterestSkillDTO>> {
    return this.http
      .put<ResponseObjectDTO<InterestSkillDTO>>(
        environment.httpUrl + '/v1/api/' + 'skill/' + uuid,
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  deleteSkill(uuid: string): Observable<ResponseObjectDTO<InterestSkillDTO>> {
    return this.http
      .delete<ResponseObjectDTO<InterestSkillDTO>>(
        environment.httpUrl + '/v1/api/' + 'skill/' + uuid
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //User List
  getUserList(
    page: number,
    limit: number,
    search: string,
    sortBy: string
  ): Observable<ResponseArrayDTO<UserListDTO[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('search', search)
      .set('sortBy', sortBy);
    return this.http
      .get<ResponseArrayDTO<UserListDTO[]>>(
        environment.httpUrl + '/v1/api/' + 'user-list',
        { params: params }
      )
      .pipe(
        tap((data) => {
          if (data.data.result) {
            data.data.result.forEach((subdata) => {
              subdata.userPhoto =
                environment.httpUrl +
                '/v1/api/file-manager/avatar/' +
                subdata.personalNumber;
            });
          }
        }),
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  getUserListByPersonalNumber(
    personalNumber: string
  ): Observable<ResponseObjectDTO<UserListDTO>> {
    return this.http
      .get<ResponseObjectDTO<UserListDTO>>(
        environment.httpUrl + '/v1/api/' + 'user-list/' + personalNumber
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  createUserList(
    requestBody: object
  ): Observable<ResponseObjectDTO<UserListDTO>> {
    return this.http
      .post<ResponseObjectDTO<UserListDTO>>(
        environment.httpUrl + '/v1/api/' + 'user-list',
        requestBody
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  updateUserList(
    personalNumber: string,
    requestBody: object
  ): Observable<UserListDTO> {
    return this.http
      .put<UserListDTO>(
        environment.httpUrl + '/v1/api/' + 'user-list/' + personalNumber,
        requestBody
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //User Skill
  createUserSkill(dto: UserSkillDTO): Observable<UserSkillDTO> {
    return this.http
      .post<UserSkillDTO>(
        environment.httpUrl + '/v1/api/' + 'user-list/user-skill',
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  updateUserSkill(uuid: string, dto: UserSkillDTO): Observable<UserSkillDTO> {
    return this.http
      .put<UserSkillDTO>(
        environment.httpUrl + '/v1/api/' + 'user-list/user-skill/' + uuid,
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //User Interest
  createUserInterest(dto: UserInterestDTO): Observable<UserInterestDTO> {
    return this.http
      .post<UserInterestDTO>(
        environment.httpUrl + '/v1/api/' + 'user-list/user-interest',
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  updateUserInterest(
    uuid: string,
    dto: UserInterestDTO
  ): Observable<UserInterestDTO> {
    return this.http
      .put<UserInterestDTO>(
        environment.httpUrl + '/v1/api/' + 'user-list/user-interest/' + uuid,
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  // Generate Token
  tokenGenerate(dto: AuthDTO): Observable<ResponseObjectDTO<UserListDTO>> {
    return this.http
      .post<ResponseObjectDTO<UserListDTO>>(
        environment.httpUrl + '/v1/api/' + 'auth/login',
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  // Get User Interest
  getUserInterests(
    personalNumber: string
  ): Observable<ResponseArrayDTO<UserInterestDTO[]>> {
    return this.http
      .get<ResponseArrayDTO<UserInterestDTO[]>>(
        environment.httpUrl +
          '/v1/api/' +
          'user-list/' +
          'user-interest/' +
          personalNumber
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  // Check Token
  checkToken(token: string): Observable<ResponseObjectDTO<boolean>> {
    return this.http
      .get<ResponseObjectDTO<boolean>>(
        environment.httpUrl + '/v1/api/' + 'auth/check/' + token
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  // Delete Token
  destroyToken(token: string): Observable<ResponseObjectDTO<boolean>> {
    return this.http
      .delete<ResponseObjectDTO<boolean>>(
        environment.httpUrl + '/v1/api/' + 'auth/logout/' + token
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  // Get Permission
  getMasterPermission(
    page: number,
    limit: number,
    search: string
  ): Observable<ResponseArrayDTO<MasterPermissionDTO[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('search', search);
    return this.http
      .get<ResponseArrayDTO<MasterPermissionDTO[]>>(
        environment.httpUrl + '/v1/api/' + 'permission',
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  // Get Data Roles
  getRoles(
    page: number,
    limit: number,
    search: string,
    sortBy: string
  ): Observable<ResponseArrayDTO<RolePermissionDTO[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('search', search)
      .set('sortBy', sortBy);
    return this.http
      .get<ResponseArrayDTO<RolePermissionDTO[]>>(
        environment.httpUrl + '/v1/api/' + 'role-permission',
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  // Create Role Permission
  createRolePermission(
    dto: RolePermissionCreateDTO
  ): Observable<RolePermissionDTO> {
    return this.http
      .post<RolePermissionDTO>(
        environment.httpUrl + '/v1/api/' + 'role-permission',
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  // Update Role Permission
  updateRolePermission(
    uuid: string,
    dto: RolePermissionCreateDTO
  ): Observable<RolePermissionDTO> {
    return this.http
      .put<RolePermissionDTO>(
        environment.httpUrl + '/v1/api/' + 'role-permission/' + uuid,
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  // Delete Role
  deleteRolePermission(uuid: string): Observable<RolePermissionDTO[]> {
    return this.http
      .delete<RolePermissionDTO[]>(
        environment.httpUrl + '/v1/api/' + 'role-permission/' + uuid
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  // Get User In Role
  getUserInRole(
    roleId: number,
    page: number,
    limit: number,
    search: string
  ): Observable<ResponseArrayDTO<UserInRoleDTO[]>> {
    const params = new HttpParams()
      .set('roleId', roleId)
      .set('page', page)
      .set('limit', limit)
      .set('search', search);
    return this.http
      .get<ResponseArrayDTO<UserInRoleDTO[]>>(
        environment.httpUrl + '/v1/api/' + 'role-permission/user-role',
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  // Create User In Role
  createUserInRole(dto: UserInRoleCreateDTO): Observable<UserInRoleCreateDTO> {
    return this.http
      .post<UserInRoleCreateDTO>(
        environment.httpUrl + '/v1/api/' + 'role-permission/user-role',
        dto
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  // Delete User In Role
  deleteUserInRole(uuid: string): Observable<UserInRoleCreateDTO> {
    return this.http
      .delete<UserInRoleCreateDTO>(
        environment.httpUrl + '/v1/api/' + 'role-permission/user-role/' + uuid
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  // Get Permission In Role
  getPermissionInRole(
    uuid: string
  ): Observable<ResponseObjectDTO<RolePermissionDTO>> {
    return this.http
      .get<ResponseObjectDTO<RolePermissionDTO>>(
        environment.httpUrl + '/v1/api/' + 'role-permission/' + uuid
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  //Get Notification
  getNotification(
    page: number,
    limit: number
  ): Observable<ResponseArrayDTO<NotificationDTO[]>> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http
      .get<ResponseArrayDTO<NotificationDTO[]>>(
        environment.httpUrl + '/v1/api/' + 'notification',
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Get Notification By Personal Number
  getNotificationByPersonalNumber(
    personalNumber: string,
    page: number,
    limit: number
  ): Observable<ResponseArrayDTO<NotificationDTO[]>> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http
      .get<ResponseArrayDTO<NotificationDTO[]>>(
        environment.httpUrl + '/v1/api/' + 'notification/' + personalNumber,
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  readNotification(
    uuid: string,
    dto: NotificationReadRequestDTO
  ): Observable<ResponseObjectDTO<NotificationDTO>> {
    return this.http
      .put<ResponseObjectDTO<NotificationDTO>>(
        environment.httpUrl + '/v1/api/' + 'notification/read/' + uuid,
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Create Notification
  createNotification(dto: NotificationRequestDTO): Observable<NotificationDTO> {
    return this.http
      .post<NotificationDTO>(
        environment.httpUrl + '/v1/api/' + 'notification',
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Sign As
  signAs(personalNumber: string, signAs: signAsDTO): Observable<boolean> {
    return this.http
      .put<boolean>(
        environment.httpUrl +
          '/v1/api/' +
          'user-list/sign-as/' +
          personalNumber,
        signAs
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  getFollower(
    page: number,
    limit: number,
    personalNumber: string
  ): Observable<ResponseArrayDTO<FollowerFollowingDTO[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('personalNumber', personalNumber);
    return this.http
      .get<ResponseArrayDTO<FollowerFollowingDTO[]>>(
        `${environment.httpUrl}/v1/api/user-list/follower`,
        { params: params }
      )
      .pipe(
        tap((res) => {
          res.data.result.forEach((subdata) => {
            this.soeService
              .getUserData(subdata.personalNumberFollowing)
              .subscribe((res) => {
                subdata.personalNameFollowing = res.personalName;
              });
          });
        }),
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  getFollowing(
    page: number,
    limit: number,
    personalNumber: string
  ): Observable<ResponseArrayDTO<FollowerFollowingDTO[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('personalNumber', personalNumber);
    return this.http
      .get<ResponseArrayDTO<FollowerFollowingDTO[]>>(
        `${environment.httpUrl}/v1/api/user-list/following`,
        { params: params }
      )
      .pipe(
        tap((res) => {
          res.data.result.forEach((subdata) => {
            this.soeService
              .getUserData(subdata.personalNumberFollower)
              .subscribe((res) => {
                subdata.personalNameFollower = res.personalName;
              });
          });
        }),
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  createFollowerFollowing(
    dto: CreateFollowerFollowingDTO
  ): Observable<ResponseObjectDTO<MergeFollowDTO>> {
    return this.http
      .post<ResponseObjectDTO<MergeFollowDTO>>(
        `${environment.httpUrl}/v1/api/user-list/follower-following`,
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  deleteFollower(
    uuid: string
  ): Observable<ResponseArrayDTO<FollowerFollowingDTO[]>> {
    return this.http
      .delete<ResponseArrayDTO<FollowerFollowingDTO[]>>(
        `${environment.httpUrl}/v1/api/user-list/follower-following/` + uuid
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  getForYourPage(
    page: number,
    limit: number,
    personalNumber: string
  ): Observable<ResponseArrayDTO<ForYourPageDTO[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('personalNumber', personalNumber);
    return this.http
      .get<ResponseArrayDTO<ForYourPageDTO[]>>(
        `${environment.httpUrl}/v1/api/for-your-page`,
        { params: params }
      )
      .pipe(
        tap((data) => {
          if (data.data.result) {
            data.data.result.forEach((subdata) => {
              subdata.path =
                environment.httpUrl +
                '/v1/api/file-manager/get-imagepdf/' +
                subdata.path;
              subdata.cover =
                environment.httpUrl +
                '/v1/api/file-manager/get-imagepdf/' +
                subdata.cover;
            });
          }
        }),
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  followerChecker(
    follower: string,
    following: string
  ): Observable<ResponseObjectDTO<boolean>> {
    const params = new HttpParams()
      .set('follower', follower)
      .set('following', following);
    return this.http
      .get<ResponseObjectDTO<boolean>>(
        `${environment.httpUrl}/v1/api/user-list/checker`,
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  getCommunityUser(
    personalNumber: string
  ): Observable<ResponseObjectDTO<CommunityUserDTO[]>> {
    return this.http
      .get<ResponseObjectDTO<CommunityUserDTO[]>>(
        `${environment.httpUrl}/v1/api/community-follow/community-user/${personalNumber}`
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  getActivityCommunityByUser(
    personalNumber: string,
    page: number,
    limit: number
  ): Observable<ResponseArrayDTO<RecentActivityDTO[]>> {
    const params = new HttpParams()
      .set('personalNumber', personalNumber)
      .set('page', page)
      .set('limit', limit);
    return this.http
      .get<ResponseArrayDTO<RecentActivityDTO[]>>(
        `${environment.httpUrl}/v1/api/community-activity/activity-by-user`,
        { params: params }
      )
      .pipe(
        tap((data) => {
          data.data.result.forEach((subdata) => {
            subdata.path =
              environment.httpUrl +
              '/v1/api/file-manager/get-imagepdf/' +
              subdata.path;
          });
        }),
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }
}
