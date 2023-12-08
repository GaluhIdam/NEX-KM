import { HttpClient, HttpEvent } from '@angular/common/http';
import { HttpService } from 'src/app/providers/http/http.service';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import { PaginationDTO } from '../../dtos/pagination.dto';
import { SerieDTO } from '../../dtos/nex-talk/serie.dto';
import { CreatorDTO } from '../../dtos/nex-talk/creator.dto';
import { StatisticDTO } from '../../dtos/nex-talk/statistic.dto';
import { ResponseArrayDTO, ResponseObjectDTO } from '../../dtos/response.dto';
import { UserListDTO } from 'src/app/pages/user/home-page/dtos/user-list.dto';

export type ResponseMaster<U extends string, T> = Record<U, T>;

@Injectable()
export class CreatorDataService extends HttpService<SerieDTO> {
  constructor(private readonly _httpClient: HttpClient) {
    super(_httpClient);
  }

  getCreatorData(
    params?: string
  ): Observable<ResponseMaster<'data', PaginationDTO<CreatorDTO[]>>> {
    return this.get<any, ResponseMaster<'data', PaginationDTO<CreatorDTO[]>>>(
      `${environment.httpUrl}/v1/api/creator?${params}`
    );
  }

  getCreatorStatiscticData(): Observable<ResponseMaster<'data', StatisticDTO>> {
    return this.get<any, ResponseMaster<'data', StatisticDTO>>(
      `${environment.httpUrl}/v1/api/creator/statistic`
    );
  }

  getCreatorDetailByUuid(
    uuid: string
  ): Observable<ResponseObjectDTO<CreatorDTO>> {
    return this._httpClient.get<ResponseObjectDTO<CreatorDTO>>(
      `${environment.httpUrl}/v1/api/creator/${uuid}`
    );
  }

  storeCreatorData(
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<CreatorDTO>>> {
    return this._httpClient.post<ResponseObjectDTO<CreatorDTO>>(
      `${environment.httpUrl}/v1/api/creator`,
      requestBody,
      { reportProgress: true, observe: 'events' }
    );
  }

  updateCreatorData(
    uuid: string,
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<CreatorDTO>>> {
    return this._httpClient.put<ResponseObjectDTO<CreatorDTO>>(
      `${environment.httpUrl}/v1/api/creator/${uuid}`,
      requestBody,
      { reportProgress: true, observe: 'events' }
    );
  }

  updateCreatorStatus(uuid: string, requestBody: object): Observable<any> {
    return this.put(
      `${environment.httpUrl}/v1/api/creator/status/${uuid}`,
      requestBody
    );
  }

  updateCreatorEditorChoice(
    uuid: string,
    requestBody: object
  ): Observable<any> {
    return this.put(
      `${environment.httpUrl}/v1/api/creator/editor-choice/${uuid}`,
      requestBody
    );
  }

  updateCreatorStatusApproval(
    uuid: string,
    requestBody: object
  ): Observable<any> {
    return this.put(
      `${environment.httpUrl}/v1/api/creator/status-approval/${uuid}`,
      requestBody
    );
  }

  getUserListForCollaborator(
    params?: string
  ): Observable<ResponseArrayDTO<UserListDTO[]>> {
    return this._httpClient.get<ResponseArrayDTO<UserListDTO[]>>(
      `${environment.httpUrl}/v1/api/user-list?${params}`
    );
  }
}
