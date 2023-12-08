import { Observable } from 'rxjs';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { HttpEvent } from '@angular/common/http';
import { PaginationDTO } from '../../dtos/pagination.dto';
import { UserListDTO } from '../../dtos/homepage/user_list';

export abstract class UserListServiceInterface {
  abstract getUserListData(
    params?: string
  ): Observable<ResponseObjectDTO<PaginationDTO<UserListDTO[]>>>;

  abstract getUserListDataByUuid(
    uuid: string
  ): Observable<ResponseObjectDTO<UserListDTO>>;

  abstract storeUserListData(
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<UserListDTO>>>;

  abstract updateUserListData(
    uuid: string,
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<UserListDTO>>>;

  abstract updateUserListDataStatus(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<UserListDTO>>;

  abstract deleteUserListData(
    requestBody: object
  ): Observable<ResponseObjectDTO<UserListDTO>>;
}
