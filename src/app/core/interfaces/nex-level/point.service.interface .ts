import { Observable } from 'rxjs';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { HttpEvent } from '@angular/common/http';
import { PaginationDTO } from '../../dtos/pagination.dto';
import { PointDTO } from '../../dtos/nex-level/point';


export abstract class PointServiceInterface {
  abstract getPointData(
    params?: string
  ): Observable<ResponseObjectDTO<PaginationDTO<PointDTO[]>>>;

  abstract getPointDataByUuid(
    uuid: string
  ): Observable<ResponseObjectDTO<PointDTO>>;

  abstract storePointData(
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<PointDTO>>>;

  abstract updatePointData(
    uuid: string,
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<PointDTO>>>;

  abstract updatePointDataStatus(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<PointDTO>>;

  abstract deletePointData(
    requestBody: object
  ): Observable<ResponseObjectDTO<PointDTO>>;
}
