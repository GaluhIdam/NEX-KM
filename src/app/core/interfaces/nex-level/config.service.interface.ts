import { Observable } from 'rxjs';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { HttpEvent } from '@angular/common/http';
import { PaginationDTO } from '../../dtos/pagination.dto';
import { ConfigDTO } from '../../dtos/nex-level/config';

export abstract class ConfigServiceInterface {
  abstract getConfigData(
    params?: string
  ): Observable<ResponseObjectDTO<PaginationDTO<ConfigDTO[]>>>;

  abstract getConfigDataByUuid(
    uuid: string
  ): Observable<ResponseObjectDTO<ConfigDTO>>;

  abstract storeConfigData(
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<ConfigDTO>>>;

  abstract updateConfigData(
    uuid: string,
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<ConfigDTO>>>;

  abstract updateConfigDataStatus(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<ConfigDTO>>;

  abstract deleteConfigData(
    requestBody: object
  ): Observable<ResponseObjectDTO<ConfigDTO>>;
}
