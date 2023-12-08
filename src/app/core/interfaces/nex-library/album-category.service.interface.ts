import { Observable } from 'rxjs';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { PaginationDTO } from '../../dtos/pagination.dto';
import { AlbumCategoryDTO } from '../../dtos/nex-library/album-category.dto';

export abstract class AlbumCategoryServiceInterface {
  abstract getAlbumCategoryData(
    params?: string
  ): Observable<ResponseObjectDTO<PaginationDTO<AlbumCategoryDTO[]>>>;

  abstract storeAlbumCategoryData(
    requestBody: object
  ): Observable<ResponseObjectDTO<AlbumCategoryDTO>>;

  abstract updateAlbumCategoryData(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<AlbumCategoryDTO>>;

  abstract updateAlbumCategoryStatus(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<AlbumCategoryDTO>>;
}
