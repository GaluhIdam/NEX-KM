import { HttpClient, HttpEvent } from '@angular/common/http';
import { HttpService } from 'src/app/providers/http/http.service';
import { Observable, lastValueFrom } from 'rxjs';
import { Injectable } from '@angular/core';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import { AlbumGalleryDTO } from '../../dtos/nex-library/album-gallery.dto';
import { PaginationDTO } from '../../dtos/pagination.dto';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { AlbumGalleryServiceInterface } from '../../interfaces/nex-library/album-gallery.service.interface';

@Injectable()
export class AlbumGalleryDataService implements AlbumGalleryServiceInterface {
  constructor(private readonly _httpClient: HttpClient) {}

  getAlbumGalleryData(
    params?: string
  ): Observable<ResponseObjectDTO<PaginationDTO<AlbumGalleryDTO[]>>> {
    return this._httpClient.get<
      ResponseObjectDTO<PaginationDTO<AlbumGalleryDTO[]>>
    >(`${environment.httpUrl}/v1/api/album-gallery?${params}`);
  }

  getAlbumGalleryDataPaginateByAlbumId(
    albumId: number,
    params?: string
  ): Observable<ResponseObjectDTO<PaginationDTO<AlbumGalleryDTO[]>>> {
    return this._httpClient.get<
      ResponseObjectDTO<PaginationDTO<AlbumGalleryDTO[]>>
    >(`${environment.httpUrl}/v1/api/album-gallery/album/${albumId}?${params}`);
  }

  storeAlbumGalleryData(
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<AlbumGalleryDTO>>> {
    return this._httpClient.post<ResponseObjectDTO<AlbumGalleryDTO>>(
      `${environment.httpUrl}/v1/api/album-gallery`,
      requestBody,
      { reportProgress: true, observe: 'events' }
    );
  }

  deleteAlbumGalleryData(
    requestBody: object
  ): Observable<ResponseObjectDTO<AlbumGalleryDTO>> {
    return this._httpClient.delete<ResponseObjectDTO<AlbumGalleryDTO>>(
      `${environment.httpUrl}/v1/api/album-gallery`,
      { body: requestBody }
    );
  }
}
