import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import { PaginationDTO } from '../../dtos/pagination.dto';
import { SerieDTO } from '../../dtos/nex-talk/serie.dto';
import { StatisticDTO } from '../../dtos/nex-talk/statistic.dto';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { SerieServiceInterface } from '../../interfaces/nex-talk/serie.service.interface';

@Injectable()
export class SerieDataService implements SerieServiceInterface {
  constructor(private readonly _httpClient: HttpClient) {}

  getSerieData(
    params?: string
  ): Observable<ResponseObjectDTO<PaginationDTO<SerieDTO[]>>> {
    return this._httpClient.get<ResponseObjectDTO<PaginationDTO<SerieDTO[]>>>(
      `${environment.httpUrl}/v1/api/serie?${params}`
    );
  }

  getSerieStatiscticData(): Observable<ResponseObjectDTO<StatisticDTO>> {
    return this._httpClient.get<ResponseObjectDTO<StatisticDTO>>(
      `${environment.httpUrl}/v1/api/serie/statistic`
    );
  }

  getSerieDetailByUuid(uuid: string): Observable<ResponseObjectDTO<SerieDTO>> {
    return this._httpClient.get<ResponseObjectDTO<SerieDTO>>(
      `${environment.httpUrl}/v1/api/serie/${uuid}`
    );
  }

  storeSerieData(
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<SerieDTO>>> {
    return this._httpClient.post<ResponseObjectDTO<SerieDTO>>(
      `${environment.httpUrl}/v1/api/serie`,
      requestBody,
      { reportProgress: true, observe: 'events' }
    );
  }

  updateSerieData(
    uuid: string,
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<SerieDTO>>> {
    return this._httpClient.put<ResponseObjectDTO<SerieDTO>>(
      `${environment.httpUrl}/v1/api/serie/${uuid}`,
      requestBody,
      { reportProgress: true, observe: 'events' }
    );
  }

  updateSerieStatus(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<SerieDTO>> {
    return this._httpClient.put<ResponseObjectDTO<SerieDTO>>(
      `${environment.httpUrl}/v1/api/serie/status/${uuid}`,
      requestBody
    );
  }

  updateSerieEditorChoice(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<SerieDTO>> {
    return this._httpClient.put<ResponseObjectDTO<SerieDTO>>(
      `${environment.httpUrl}/v1/api/serie/editor-choice/${uuid}`,
      requestBody
    );
  }

  updateSerieStatusApproval(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<SerieDTO>> {
    return this._httpClient.put<ResponseObjectDTO<SerieDTO>>(
      `${environment.httpUrl}/v1/api/serie/status-approval/${uuid}`,
      requestBody
    );
  }
}
