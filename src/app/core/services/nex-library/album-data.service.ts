import { HttpClient, HttpEvent } from '@angular/common/http';
import { HttpService } from 'src/app/providers/http/http.service';
import { Observable, lastValueFrom } from 'rxjs';
import { Injectable } from '@angular/core';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import { AlbumDTO } from '../../dtos/nex-library/album.dto';
import { PaginationDTO } from '../../dtos/pagination.dto';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { AlbumServiceInterface } from '../../interfaces/nex-library/album.service.interface';

@Injectable()
export class AlbumDataService implements AlbumServiceInterface {
  constructor(private readonly _httpClient: HttpClient) {}

  getAlbumData(
    params?: string
  ): Observable<ResponseObjectDTO<PaginationDTO<AlbumDTO[]>>> {
    return this._httpClient.get<ResponseObjectDTO<PaginationDTO<AlbumDTO[]>>>(
      `${environment.httpUrl}/v1/api/album?${params}`
    );
  }

  getAlbumDataByPersonalNumber(
    personalNumber: string,
    params?: string
  ): Observable<ResponseObjectDTO<AlbumDTO[]>> {
    return this._httpClient.get<ResponseObjectDTO<AlbumDTO[]>>(
      `${environment.httpUrl}/v1/api/album/by-personal-number/${personalNumber}?${params}`
    );
  }

  getAlbumDetailDataByUuid(
    uuid: string
  ): Observable<ResponseObjectDTO<AlbumDTO>> {
    return this._httpClient.get<ResponseObjectDTO<AlbumDTO>>(
      `${environment.httpUrl}/v1/api/album/${uuid}`
    );
  }

  storeAlbumData(
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<AlbumDTO>>> {
    return this._httpClient.post<ResponseObjectDTO<AlbumDTO>>(
      `${environment.httpUrl}/v1/api/album`,
      requestBody,
      { reportProgress: true, observe: 'events' }
    );
  }

  updateAlbumData(
    uuid: string,
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<AlbumDTO>>> {
    return this._httpClient.put<ResponseObjectDTO<AlbumDTO>>(
      `${environment.httpUrl}/v1/api/album/${uuid}`,
      requestBody,
      { reportProgress: true, observe: 'events' }
    );
  }

  updateAlbumStatus(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<AlbumDTO>> {
    return this._httpClient.put<ResponseObjectDTO<AlbumDTO>>(
      `${environment.httpUrl}/v1/api/album/status/${uuid}`,
      requestBody
    );
  }

  updateAlbumStatusApproval(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<AlbumDTO>> {
    return this._httpClient.put<ResponseObjectDTO<AlbumDTO>>(
      `${environment.httpUrl}/v1/api/album/status-approval/${uuid}`,
      requestBody
    );
  }
}
