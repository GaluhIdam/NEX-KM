import { Observable } from 'rxjs';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { PaginationDTO } from '../../dtos/pagination.dto';
import { AlbumGalleryDTO } from '../../dtos/nex-library/album-gallery.dto';
import { HttpEvent } from '@angular/common/http';

export abstract class AlbumGalleryServiceInterface {
  abstract getAlbumGalleryData(
    params?: string
  ): Observable<ResponseObjectDTO<PaginationDTO<AlbumGalleryDTO[]>>>;

  abstract getAlbumGalleryDataPaginateByAlbumId(
    albumId: number,
    params?: string
  ): Observable<ResponseObjectDTO<PaginationDTO<AlbumGalleryDTO[]>>>;

  abstract storeAlbumGalleryData(
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<AlbumGalleryDTO>>>;

  abstract deleteAlbumGalleryData(
    requestBody: object
  ): Observable<ResponseObjectDTO<AlbumGalleryDTO>>;
}
