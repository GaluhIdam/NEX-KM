import { Observable } from 'rxjs';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { PaginationDTO } from '../../dtos/pagination.dto';
import { EBookDTO } from '../../dtos/nex-library/ebook.dto';
import { HttpEvent } from '@angular/common/http';

export abstract class EbookServiceInterface {
  abstract getEBookData(
    params?: string
  ): Observable<ResponseObjectDTO<PaginationDTO<EBookDTO[]>>>;

  abstract getEBookDetailDataByUuid(
    uuid: string
  ): Observable<ResponseObjectDTO<EBookDTO>>;

  abstract storeEbookData(
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<EBookDTO>>>;

  abstract updateData(
    uuid: string,
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<EBookDTO>>>;

  abstract updateEbookStatus(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<EBookDTO>>;

  abstract updateEbookEditorChoice(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<EBookDTO>>;

  abstract updateEbookStatusApproval(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<EBookDTO>>;
}
