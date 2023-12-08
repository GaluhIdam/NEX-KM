import { Observable } from 'rxjs';
import { AlbumDTO } from '../../dtos/nex-library/album.dto';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { HttpEvent } from '@angular/common/http';
import { PaginationDTO } from '../../dtos/pagination.dto';

export abstract class AlbumServiceInterface {
  abstract getAlbumData(
    params?: string
  ): Observable<ResponseObjectDTO<PaginationDTO<AlbumDTO[]>>>;

  abstract getAlbumDataByPersonalNumber(
    personalNumber: string,
    params?: string
  ): Observable<ResponseObjectDTO<AlbumDTO[]>>;

  abstract getAlbumDetailDataByUuid(
    uuid: string
  ): Observable<ResponseObjectDTO<AlbumDTO>>;

  abstract storeAlbumData(
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<AlbumDTO>>>;

  abstract updateAlbumData(
    uuid: string,
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<AlbumDTO>>>;

  abstract updateAlbumStatus(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<AlbumDTO>>;

  abstract updateAlbumStatusApproval(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<AlbumDTO>>;
}
