import { Observable } from 'rxjs';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { PaginationDTO } from '../../dtos/pagination.dto';
import { WebDirectoryDTO } from '../../dtos/nex-library/web-directory.dto';
import { HttpEvent } from '@angular/common/http';

export abstract class WebDirectoryServiceInterface {
  abstract getWebDirectoryData(
    params?: string
  ): Observable<ResponseObjectDTO<PaginationDTO<WebDirectoryDTO[]>>>;

  abstract getWebDirectoryDetailDataByUuid(
    uuid: string
  ): Observable<ResponseObjectDTO<WebDirectoryDTO>>;

  abstract storeWebDirectoryData(
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<WebDirectoryDTO>>>;

  abstract updateWebDirectoryData(
    uuid: string,
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<WebDirectoryDTO>>>;

  abstract updateWebDirectoryStatus(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<WebDirectoryDTO>>;
}
