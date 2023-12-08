import { Observable } from 'rxjs';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { PaginationDTO } from '../../dtos/pagination.dto';
import { RedeemDTO } from '../../dtos/nex-level/redeem';
import { HttpEvent } from '@angular/common/http';

export abstract class RedeemServiceInterface {
  abstract getRedeemData(
    params?: string
  ): Observable<ResponseObjectDTO<PaginationDTO<RedeemDTO[]>>>;

  abstract getRedeemDataByUuid(
    uuid: string
  ): Observable<ResponseObjectDTO<RedeemDTO>>;

  abstract storeRedeemData(
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<RedeemDTO>>>;

  abstract updateRedeemData(
    uuid: string,
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<RedeemDTO>>>;

  abstract updateRedeemDataStatus(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<RedeemDTO>>;

  abstract deleteRedeemData(
    requestBody: object
  ): Observable<ResponseObjectDTO<RedeemDTO>>;
}
