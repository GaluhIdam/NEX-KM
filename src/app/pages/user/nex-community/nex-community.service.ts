import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import { NexCommunityServiceInterface } from './interface/nex-community.interface';
import { Observable, catchError, map, throwError } from 'rxjs';
import {
  CommentActivityDTO,
  CommunityDTO,
  CommunityLikeDTO,
  CommunityMemberCreateDTO,
  CommunityMemberDTO,
  CommunityPublishDTO,
  CommunityPublishPrivateDTO,
  CreateCommentActivityDTO,
  CreateCommunityLikeDTO,
  CreateFollowDTO,
  CreateRoleCommunityDTO,
  GetFollowDTO,
  RecentActivityCreateDTO,
  RecentActivityDTO,
  RoleCommunityDTO,
} from './dto/community.dto';
import {
  ResponseArrayDTO,
  ResponseObjectDTO,
} from 'src/app/core/dtos/response.dto';
import { environment } from 'src/environments/environment.prod';
import { CommunityFuseDTO, MergeCommunityDTO } from './dto/fuse.dto';

@Injectable({
  providedIn: 'root',
})
export class NexCommunityService
  extends BaseController
  implements NexCommunityServiceInterface
{
  constructor(private http: HttpClient) {
    super(NexCommunityService.name);
  }

  //Community Method

  //Get Community
  getCommunity(
    page: number,
    limit: number,
    search: string,
    sortBy: string,
    isAdmin: boolean
  ): Observable<ResponseArrayDTO<CommunityDTO[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('search', search)
      .set('sortBy', sortBy)
      .set('isAdmin', isAdmin);
    return this.http
      .get<ResponseArrayDTO<CommunityDTO[]>>(
        environment.httpUrl + '/v1/api/' + 'community',
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Get Detail Community
  getCommunityById(uuid: string): Observable<ResponseObjectDTO<CommunityDTO>> {
    return this.http
      .get<ResponseObjectDTO<CommunityDTO>>(
        environment.httpUrl + '/v1/api/' + 'community/' + uuid
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Create Community
  createCommunity(dto: CommunityPublishDTO): Observable<CommunityDTO> {
    const formData = new FormData();
    formData.append('thumbnailPhotoFile', dto.thumbnailPhotoFile);
    formData.append('headlinePhotoFile', dto.headlinePhotoFile);
    formData.append('iconFile', dto.iconFile);
    formData.append('name', dto.name);
    formData.append('personalNumber', dto.personalNumber);
    formData.append('location', dto.location);
    formData.append('about', dto.about);
    formData.append('leader', dto.leader);
    formData.append('leaderPersonalNumber', dto.leaderPersonalNumber);
    formData.append('leaderProfile', dto.leaderProfile);
    formData.append('instagram', dto.instagram);
    formData.append('leaderUnit', dto.leaderUnit);
    formData.append('leaderEmail', dto.leaderEmail);
    formData.append('founded', `${dto.founded}` + 'T00:00:00.000Z');
    return this.http
      .post<CommunityDTO>(
        environment.httpUrl + '/v1/api/' + 'community',
        formData
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Update Community
  updateCommunity(
    uuid: string,
    dto: CommunityPublishDTO
  ): Observable<CommunityDTO> {
    const formData = new FormData();
    formData.append('name', dto.name);
    formData.append('personalNumber', dto.personalNumber);
    formData.append('location', dto.location);
    formData.append('about', dto.about);
    formData.append('leader', dto.leader);
    formData.append('leaderPersonalNumber', dto.leaderPersonalNumber);
    formData.append('leaderProfile', dto.leaderProfile);
    formData.append('instagram', dto.instagram);
    formData.append('thumbnailPhotoFile', dto.thumbnailPhotoFile);
    formData.append('headlinePhotoFile', dto.headlinePhotoFile);
    formData.append('iconFile', dto.iconFile);
    formData.append('leaderUnit', dto.leaderUnit);
    formData.append('leaderEmail', dto.leaderEmail);
    formData.append('founded', `${dto.founded}` + 'T00:00:00.000Z');
    return this.http
      .put<CommunityDTO>(
        environment.httpUrl + '/v1/api/' + 'community/' + uuid,
        formData
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Publish or Private
  publishPrivateCommunity(
    uuid: string,
    dto: CommunityPublishPrivateDTO
  ): Observable<CommunityDTO> {
    const status: CommunityPublishPrivateDTO = {
      status: dto.status,
    };
    return this.http
      .put<CommunityDTO>(
        environment.httpUrl + '/v1/api/' + 'community/publish-private/' + uuid,
        status
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Banned Community
  banCommunity(
    uuid: string,
    dto: CommunityPublishPrivateDTO
  ): Observable<CommunityDTO> {
    const status: CommunityPublishPrivateDTO = {
      status: dto.status,
    };
    return this.http
      .put<CommunityDTO>(
        environment.httpUrl + '/v1/api/' + 'community/ban-community/' + uuid,
        status
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Community Method

  //Member Method
  getMember(
    page: number,
    limit: number,
    search: string,
    sortBy: string,
    communityId: number
  ): Observable<ResponseArrayDTO<CommunityMemberDTO[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('search', search)
      .set('sortBy', sortBy)
      .set('communityId', communityId);
    return this.http
      .get<ResponseArrayDTO<CommunityMemberDTO[]>>(
        environment.httpUrl + '/v1/api/' + 'community-member',
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Create Member
  createMember(dto: CommunityMemberCreateDTO): Observable<CommunityMemberDTO> {
    return this.http
      .post<CommunityMemberDTO>(
        environment.httpUrl + '/v1/api/' + 'community-member',
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Update Member
  updateMember(
    uuid: string,
    dto: CommunityMemberCreateDTO
  ): Observable<CommunityMemberDTO> {
    return this.http
      .put<CommunityMemberDTO>(
        environment.httpUrl + '/v1/api/' + 'community-member/' + uuid,
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Delete Member
  deleteMember(uuid: string): Observable<CommunityDTO> {
    return this.http
      .delete<CommunityDTO>(
        environment.httpUrl + '/v1/api/' + 'community-member/' + uuid
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Member Method

  //Activity

  //get Activity By Uuid
  getActivityByUuid(
    uuid: string
  ): Observable<ResponseObjectDTO<RecentActivityDTO>> {
    return this.http
      .get<ResponseObjectDTO<RecentActivityDTO>>(
        environment.httpUrl + '/v1/api/' + 'community-activity/' + uuid
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  //Get Activity
  getActivity(
    page: number,
    limit: number,
    search: string,
    sortBy: string,
    communityId: number
  ): Observable<ResponseArrayDTO<RecentActivityDTO[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('search', search)
      .set('sortBy', sortBy)
      .set('communityId', communityId);
    return this.http
      .get<ResponseArrayDTO<RecentActivityDTO[]>>(
        environment.httpUrl + '/v1/api/' + 'community-activity/get-with',
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Get Activity
  getActivityAll(
    page: number,
    limit: number,
    search: string,
    sortBy: string
  ): Observable<ResponseArrayDTO<RecentActivityDTO[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('search', search)
      .set('sortBy', sortBy);
    return this.http
      .get<ResponseArrayDTO<RecentActivityDTO[]>>(
        environment.httpUrl + '/v1/api/' + 'community-activity',
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Create Activity
  createActivity(dto: RecentActivityCreateDTO): Observable<RecentActivityDTO> {
    const formData = new FormData();
    formData.append('image', dto.photo);
    formData.append('communityId', `${dto.communityId}`);
    formData.append('title', dto.title);
    formData.append('description', dto.description);
    formData.append('personalNumber', dto.personalNumber);
    formData.append('personalName', dto.personalName);
    return this.http
      .post<RecentActivityDTO>(
        environment.httpUrl + '/v1/api/community-activity/',
        formData
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Update Activity
  updateActivity(
    uuid: string,
    dto: RecentActivityCreateDTO
  ): Observable<RecentActivityDTO> {
    const formData = new FormData();
    formData.append('image', dto.photo);
    formData.append('communityId', `${dto.communityId}`);
    formData.append('title', dto.title);
    formData.append('description', dto.description);
    formData.append('personalNumber', dto.personalNumber);
    formData.append('personalName', dto.personalName);
    return this.http
      .put<RecentActivityDTO>(
        environment.httpUrl + '/v1/api/community-activity/' + uuid,
        formData
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Activity

  //Role Method

  //Get All Data Role
  getRoleAll(): Observable<ResponseArrayDTO<RoleCommunityDTO[]>> {
    return this.http
      .get<ResponseArrayDTO<RoleCommunityDTO[]>>(
        environment.httpUrl + '/v1/api/' + 'community-role'
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Get Data Role with Page
  getRoleByPage(
    page: number,
    limit: number,
    search: string,
    sortBy: string
  ): Observable<ResponseArrayDTO<RoleCommunityDTO[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('search', search)
      .set('sortBy', sortBy);
    return this.http
      .get<ResponseArrayDTO<RoleCommunityDTO[]>>(
        environment.httpUrl + '/v1/api/' + 'community-role',
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Create Role Community
  createRoleCommunity(
    dto: CreateRoleCommunityDTO
  ): Observable<ResponseObjectDTO<RoleCommunityDTO>> {
    return this.http
      .post<ResponseObjectDTO<RoleCommunityDTO>>(
        environment.httpUrl + '/v1/api/' + 'community-role',
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Update Role Community
  updateRoleCommunity(
    uuid: string,
    dto: RoleCommunityDTO
  ): Observable<ResponseObjectDTO<RoleCommunityDTO>> {
    return this.http
      .put<ResponseObjectDTO<RoleCommunityDTO>>(
        environment.httpUrl + '/v1/api/' + 'community-role/' + uuid,
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Follow Method
  createFollow(dto: CreateFollowDTO): Observable<CreateFollowDTO> {
    return this.http
      .post<CreateFollowDTO>(
        environment.httpUrl + '/v1/api/' + 'community-follow',
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  checkFollow(
    personalNumber: string,
    communityId: number
  ): Observable<ResponseObjectDTO<GetFollowDTO>> {
    const params = new HttpParams()
      .set('personalNumber', personalNumber)
      .set('communityId', communityId);
    return this.http
      .get<ResponseObjectDTO<GetFollowDTO>>(
        environment.httpUrl + '/v1/api/' + 'community-follow/check-follower',
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  deleteFollow(uuid: string): Observable<GetFollowDTO> {
    return this.http
      .delete<GetFollowDTO>(
        environment.httpUrl + '/v1/api/' + 'community-follow/' + uuid
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  getActivityComment(
    page: number,
    limit: number,
    activityId: number,
    sortBy: string
  ): Observable<ResponseArrayDTO<CommentActivityDTO[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('activityId', activityId)
      .set('sortBy', sortBy);
    return this.http
      .get<ResponseArrayDTO<CommentActivityDTO[]>>(
        environment.httpUrl + '/v1/api/' + 'community-activity-comment',
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  getActivityReplyComment(
    page: number,
    limit: number,
    activityId: number,
    parentId: number,
    sortBy: string
  ): Observable<ResponseArrayDTO<CommentActivityDTO[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('activityId', activityId)
      .set('parentId', parentId)
      .set('sortBy', sortBy);
    return this.http
      .get<ResponseArrayDTO<CommentActivityDTO[]>>(
        environment.httpUrl +
          '/v1/api/' +
          'community-activity-comment/get-child-comment',
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  createActivityComment(
    dto: CreateCommentActivityDTO
  ): Observable<ResponseObjectDTO<CreateCommentActivityDTO>> {
    return this.http
      .post<ResponseObjectDTO<CreateCommentActivityDTO>>(
        environment.httpUrl + '/v1/api/' + 'community-activity-comment',
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  updateActivityComment(
    uuid: string,
    dto: CreateCommentActivityDTO
  ): Observable<ResponseObjectDTO<CreateCommentActivityDTO>> {
    return this.http
      .put<ResponseObjectDTO<CreateCommentActivityDTO>>(
        environment.httpUrl + '/v1/api/' + 'community-activity-comment/' + uuid,
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  deleteActivityComment(
    uuid: string
  ): Observable<ResponseObjectDTO<CreateCommentActivityDTO>> {
    return this.http
      .delete<ResponseObjectDTO<CreateCommentActivityDTO>>(
        environment.httpUrl + '/v1/api/' + 'community-activity-comment/' + uuid
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  likeOrDislike(
    dto: CreateCommunityLikeDTO
  ): Observable<ResponseObjectDTO<CommunityLikeDTO>> {
    const params = new HttpParams()
      .set('activityId', dto.activityId)
      .set('commentActivityId', dto.commentActivityId)
      .set('personalNumber', dto.personalNumber);
    return this.http
      .post<ResponseObjectDTO<CommunityLikeDTO>>(
        environment.httpUrl + '/v1/api/' + 'community-activity-like',
        dto,
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Show Trending
  showTrending(): Observable<CommunityFuseDTO[]> {
    return this.http
      .get<CommunityFuseDTO[]>(
        environment.httpUrl + '/v1/api/' + 'search-community/trending'
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  //Show Suggestion
  showSuggestion(search: string): Observable<CommunityFuseDTO[]> {
    const params = new HttpParams().set('search', search);
    return this.http
      .get<CommunityFuseDTO[]>(
        environment.httpUrl + '/v1/api/' + 'search-community',
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  // Show Result Search
  showResultSearch(
    search: string,
    limit: number
  ): Observable<ResponseArrayDTO<MergeCommunityDTO[]>> {
    const params = new HttpParams().set('search', search).set('limit', limit);
    return this.http
      .get<ResponseArrayDTO<MergeCommunityDTO[]>>(
        environment.httpUrl + '/v1/api/' + 'search-community/result',
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  showResultSearchByInterest(search: string[]): Observable<MergeCommunityDTO[]> {
    let params = new HttpParams();
    search.forEach((term) => {
      params = params.append('search', term);
    });

    return this.http.get<MergeCommunityDTO[]>(
      environment.httpUrl + '/v1/api/search-community/result-interest',
      { params: params }
    );
  }
}
