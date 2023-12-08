import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable, lastValueFrom } from 'rxjs';
import { Injectable } from '@angular/core';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import { PaginationDTO } from '../../dtos/pagination.dto';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { UserListDTO } from '../../dtos/homepage/user_list';
import { UserListServiceInterface } from '../../interfaces/homepage/user-list.service.interface';

@Injectable()
export class UserListService implements UserListServiceInterface {
  constructor(private readonly _httpClient: HttpClient) {}

  getUserListData(
    params?: string
  ): Observable<ResponseObjectDTO<PaginationDTO<UserListDTO[]>>> {
    return this._httpClient.get<
      ResponseObjectDTO<PaginationDTO<UserListDTO[]>>
    >(`${environment.httpUrl}/v1/api/userlist?${params}`);
  }

  getUserListDataByUuid(
    uuid: string
  ): Observable<ResponseObjectDTO<UserListDTO>> {
    return this._httpClient.get<ResponseObjectDTO<UserListDTO>>(
      `${environment.httpUrl}/v1/api/userlist/${uuid}`
    );
  }

  storeUserListData(
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<UserListDTO>>> {
    return this._httpClient.post<ResponseObjectDTO<UserListDTO>>(
      `${environment.httpUrl}/v1/api/userlist`,
      requestBody,
      { reportProgress: true, observe: 'events' }
    );
  }

  updateUserListData(
    uuid: string,
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<UserListDTO>>> {
    return this._httpClient.put<ResponseObjectDTO<UserListDTO>>(
      `${environment.httpUrl}/v1/api/userlist/${uuid}`,
      requestBody,
      { reportProgress: true, observe: 'events' }
    );
  }

  updateUserListDataStatus(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<UserListDTO>> {
    return this._httpClient.put<ResponseObjectDTO<UserListDTO>>(
      `${environment.httpUrl}/v1/api/userlist/status/${uuid}`,
      requestBody
    );
  }

  deleteUserListData(
    requestBody: object
  ): Observable<ResponseObjectDTO<UserListDTO>> {
    return this._httpClient.delete<ResponseObjectDTO<UserListDTO>>(
      `${environment.httpUrl}/v1/api/merchandise`,
      { body: requestBody }
    );
  }
}
