import { Observable } from 'rxjs';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { HttpEvent } from '@angular/common/http';
import { PaginationDTO } from '../../dtos/pagination.dto';
import { MilesDTO } from '../../dtos/nex-level/miles';

export abstract class MilesServiceInterface {
  abstract getMilesData(
    params?: string
  ): Observable<ResponseObjectDTO<PaginationDTO<MilesDTO[]>>>;

  abstract getMilesDataByUuid(
    uuid: string
  ): Observable<ResponseObjectDTO<MilesDTO>>;

  abstract storeMilesData(
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<MilesDTO>>>;

  abstract updateMilesData(
    uuid: string,
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<MilesDTO>>>;

  abstract updateMilesDataStatus(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<MilesDTO>>;

  abstract deleteMilesData(
    requestBody: object
  ): Observable<ResponseObjectDTO<MilesDTO>>;
}
