import { Observable } from 'rxjs';
import { EBookCollectionDTO } from '../../dtos/nex-library/ebook-colllection.dto';
import { PaginationDTO } from '../../dtos/pagination.dto';
import { ResponseObjectDTO } from '../../dtos/response.dto';

export abstract class EBookCollectionServiceInterface {
  abstract getEBookCollectionData(
    params?: string
  ): Observable<ResponseObjectDTO<PaginationDTO<EBookCollectionDTO[]>>>;

  abstract storeEbookCollectionData(
    requestBody: object
  ): Observable<ResponseObjectDTO<EBookCollectionDTO>>;

  abstract checkEbookCollectionData(
    requestBody: object
  ): Observable<ResponseObjectDTO<EBookCollectionDTO>>;

  abstract deleteEbookCollectionData(
    uuid: string
  ): Observable<ResponseObjectDTO<EBookCollectionDTO>>;
}
