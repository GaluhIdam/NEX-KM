import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import { PaginationDTO } from '../../dtos/pagination.dto';
import { ForumDTO } from '../../dtos/nex-talk/forum.dto';
import { StatisticDTO } from '../../dtos/nex-talk/statistic.dto';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { ForumServiceInterface } from '../../interfaces/nex-talk/forum.service.interface';

@Injectable()
export class ForumDataService implements ForumServiceInterface {
  constructor(private readonly _httpClient: HttpClient) {}

  getForumData(
    params?: string
  ): Observable<ResponseObjectDTO<PaginationDTO<ForumDTO[]>>> {
    return this._httpClient.get<ResponseObjectDTO<PaginationDTO<ForumDTO[]>>>(
      `${environment.httpUrl}/v1/api/forum?${params}`
    );
  }

  getForumStatiscticData(): Observable<ResponseObjectDTO<StatisticDTO>> {
    return this._httpClient.get<ResponseObjectDTO<StatisticDTO>>(
      `${environment.httpUrl}/v1/api/forum/statistic`
    );
  }

  getForumDetailDataByUuid(
    uuid: string
  ): Observable<ResponseObjectDTO<ForumDTO>> {
    return this._httpClient.get<ResponseObjectDTO<ForumDTO>>(
      `${environment.httpUrl}/v1/api/forum/${uuid}`
    );
  }

  storeForumData(
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<ForumDTO>>> {
    return this._httpClient.post<ResponseObjectDTO<ForumDTO>>(
      `${environment.httpUrl}/v1/api/forum`,
      requestBody,
      { reportProgress: true, observe: 'events' }
    );
  }

  updateForumStatus(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<ForumDTO>> {
    return this._httpClient.put<ResponseObjectDTO<ForumDTO>>(
      `${environment.httpUrl}/v1/api/forum/status/${uuid}`,
      requestBody
    );
  }

  updateForumEditorChoice(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<ForumDTO>> {
    return this._httpClient.put<ResponseObjectDTO<ForumDTO>>(
      `${environment.httpUrl}/v1/api/forum/editor-choice/${uuid}`,
      requestBody
    );
  }

  updateForumStatusApproval(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<ForumDTO>> {
    return this._httpClient.put<ResponseObjectDTO<ForumDTO>>(
      `${environment.httpUrl}/v1/api/forum/status-approval/${uuid}`,
      requestBody
    );
  }

  deleteForumData(uuid: string): Observable<ResponseObjectDTO<ForumDTO>> {
    return this._httpClient.delete<ResponseObjectDTO<ForumDTO>>(
      `${environment.httpUrl}/v1/api/forum/${uuid}`
    );
  }
}
