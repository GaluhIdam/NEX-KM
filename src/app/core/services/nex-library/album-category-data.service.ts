import { HttpClient } from '@angular/common/http';
import { Observable, lastValueFrom } from 'rxjs';
import { Injectable } from '@angular/core';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import { AlbumCategoryDTO } from '../../dtos/nex-library/album-category.dto';
import { PaginationDTO } from '../../dtos/pagination.dto';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { AlbumCategoryServiceInterface } from '../../interfaces/nex-library/album-category.service.interface';

@Injectable()
export class AlbumCategoryDataService implements AlbumCategoryServiceInterface {
  constructor(private readonly _httpClient: HttpClient) {}

  getAlbumCategoryData(
    params?: string
  ): Observable<ResponseObjectDTO<PaginationDTO<AlbumCategoryDTO[]>>> {
    return this._httpClient.get<
      ResponseObjectDTO<PaginationDTO<AlbumCategoryDTO[]>>
    >(`${environment.httpUrl}/v1/api/album-category?${params}`);
  }

  storeAlbumCategoryData(
    requestBody: object
  ): Observable<ResponseObjectDTO<AlbumCategoryDTO>> {
    return this._httpClient.post<ResponseObjectDTO<AlbumCategoryDTO>>(
      `${environment.httpUrl}/v1/api/album-category`,
      requestBody
    );
  }

  updateAlbumCategoryData(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<AlbumCategoryDTO>> {
    return this._httpClient.put<ResponseObjectDTO<AlbumCategoryDTO>>(
      `${environment.httpUrl}/v1/api/album-category/${uuid}`,
      requestBody
    );
  }

  updateAlbumCategoryStatus(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<AlbumCategoryDTO>> {
    return this._httpClient.put<ResponseObjectDTO<AlbumCategoryDTO>>(
      `${environment.httpUrl}/v1/api/album-category/status/${uuid}`,
      requestBody
    );
  }
}
