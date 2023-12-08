import { Observable } from 'rxjs';
import {
  CommunityDTO,
  CommunityMemberCreateDTO,
  CommunityMemberDTO,
  CommunityPublishDTO,
  CommunityPublishPrivateDTO,
  RecentActivityCreateDTO,
  RecentActivityDTO,
  RoleCommunityDTO,
} from '../dto/community.dto';
import {
  ResponseArrayDTO,
  ResponseObjectDTO,
} from 'src/app/core/dtos/response.dto';

export abstract class NexCommunityServiceInterface {
  //Community Method
  abstract getCommunity(
    page: number,
    limit: number,
    search: string,
    sortBy: string,
    isAdmin: boolean
  ): Observable<ResponseArrayDTO<CommunityDTO[]>>;
  abstract getCommunityById(
    uuid: string
  ): Observable<ResponseObjectDTO<CommunityDTO>>;
  abstract createCommunity(dto: CommunityPublishDTO): Observable<CommunityDTO>;
  abstract updateCommunity(
    uuid: string,
    dto: CommunityPublishDTO
  ): Observable<CommunityDTO>;
  abstract publishPrivateCommunity(
    uuid: string,
    dto: CommunityPublishPrivateDTO
  ): Observable<CommunityDTO>;
  abstract banCommunity(
    uuid: string,
    dto: CommunityPublishPrivateDTO
  ): Observable<CommunityDTO>;
  //Community Method

  //Member Method
  abstract getMember(
    page: number,
    limit: number,
    search: string,
    sortBy: string,
    communityId: number
  ): Observable<ResponseArrayDTO<CommunityMemberDTO[]>>;
  abstract createMember(
    dto: CommunityMemberCreateDTO
  ): Observable<CommunityMemberDTO>;
  abstract updateMember(
    uuid: string,
    dto: CommunityMemberCreateDTO
  ): Observable<CommunityMemberDTO>;
  abstract deleteMember(uuid: string): Observable<CommunityDTO>;
  //Member Method

  //Activity Method

  //Get Activity By Uuid
  abstract getActivityByUuid(
    uuid: string
  ): Observable<ResponseObjectDTO<RecentActivityDTO>>;

  //Get Activity
  abstract getActivity(
    page: number,
    limit: number,
    search: string,
    sortBy: string,
    communityId: number
  ): Observable<ResponseArrayDTO<RecentActivityDTO[]>>;

  //Create Activity
  abstract createActivity(
    dto: RecentActivityCreateDTO
  ): Observable<RecentActivityDTO>;

  //Update Activity
  abstract updateActivity(
    uuid: string,
    dto: RecentActivityCreateDTO
  ): Observable<RecentActivityDTO>;

  //Activity Method

  //Role Method
  abstract getRoleAll(): Observable<ResponseArrayDTO<RoleCommunityDTO[]>>;
  abstract getRoleByPage(
    page: number,
    limit: number,
    search: string,
    sortBy: string
  ): Observable<ResponseArrayDTO<RoleCommunityDTO[]>>;
}
