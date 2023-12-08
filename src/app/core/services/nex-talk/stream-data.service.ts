import { HttpClient, HttpEvent } from '@angular/common/http';
import { HttpService } from 'src/app/providers/http/http.service';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import { PaginationDTO } from '../../dtos/pagination.dto';
import { SerieDTO } from '../../dtos/nex-talk/serie.dto';
import { StreamDTO } from '../../dtos/nex-talk/stream.dto';
import { StatisticDTO } from '../../dtos/nex-talk/statistic.dto';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { StreamServiceInterface } from '../../interfaces/nex-talk/stream.service.interface';
import { WatchStreamDTO } from '../../dtos/nex-talk/watch-stream.dto';

@Injectable()
export class StreamDataService implements StreamServiceInterface {
  constructor(private readonly _httpClient: HttpClient) {}

  getStreamData(
    params?: string
  ): Observable<ResponseObjectDTO<PaginationDTO<StreamDTO[]>>> {
    return this._httpClient.get<ResponseObjectDTO<PaginationDTO<StreamDTO[]>>>(
      `${environment.httpUrl}/v1/api/stream?${params}`
    );
  }

  getStreamDetailDataByUuid(
    uuid: string
  ): Observable<ResponseObjectDTO<StreamDTO>> {
    return this._httpClient.get<ResponseObjectDTO<StreamDTO>>(
      `${environment.httpUrl}/v1/api/stream/${uuid}`
    );
  }

  getStreamStatiscticData(): Observable<ResponseObjectDTO<StatisticDTO>> {
    return this._httpClient.get<ResponseObjectDTO<StatisticDTO>>(
      `${environment.httpUrl}/v1/api/stream/statistic`
    );
  }

  storeStreamData(
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<StreamDTO>>> {
    return this._httpClient.post<ResponseObjectDTO<StreamDTO>>(
      `${environment.httpUrl}/v1/api/stream`,
      requestBody,
      { reportProgress: true, observe: 'events' }
    );
  }

  updateStreamData(
    uuid: string,
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<StreamDTO>>> {
    return this._httpClient.put<ResponseObjectDTO<StreamDTO>>(
      `${environment.httpUrl}/v1/api/stream/${uuid}`,
      requestBody,
      { reportProgress: true, observe: 'events' }
    );
  }

  updateStreamStatus(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<StreamDTO>> {
    return this._httpClient.put<ResponseObjectDTO<StreamDTO>>(
      `${environment.httpUrl}/v1/api/stream/status/${uuid}`,
      requestBody
    );
  }

  updateStreamEditorChoice(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<StreamDTO>> {
    return this._httpClient.put<ResponseObjectDTO<StreamDTO>>(
      `${environment.httpUrl}/v1/api/stream/editor-choice/${uuid}`,
      requestBody
    );
  }

  updateStreamStatusApproval(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<StreamDTO>> {
    return this._httpClient.put<ResponseObjectDTO<StreamDTO>>(
      `${environment.httpUrl}/v1/api/stream/status-approval/${uuid}`,
      requestBody
    );
  }

  addWatchStream(
    requestBody: object
  ): Observable<ResponseObjectDTO<WatchStreamDTO>> {
    return this._httpClient.post<ResponseObjectDTO<WatchStreamDTO>>(
      `${environment.httpUrl}/v1/api/stream/add-watch`,
      requestBody
    );
  }
}
