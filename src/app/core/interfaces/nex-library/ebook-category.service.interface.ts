import { Observable } from 'rxjs';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { PaginationDTO } from '../../dtos/pagination.dto';
import { EBookCategoryDTO } from '../../dtos/nex-library/ebook-category.dto';

export abstract class EBookCategoryServiceInterface {
  abstract getEBookCategoryData(
    params?: string
  ): Observable<ResponseObjectDTO<PaginationDTO<EBookCategoryDTO[]>>>;

  abstract storeEbookCategoryData(
    requestBody: object
  ): Observable<ResponseObjectDTO<EBookCategoryDTO>>;

  abstract updateEbookCategoryData(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<EBookCategoryDTO>>;

  abstract updateEbookCategoryStatus(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<EBookCategoryDTO>>;
}
