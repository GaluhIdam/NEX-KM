import { Observable } from 'rxjs';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { PaginationDTO } from '../../dtos/pagination.dto';
import { HttpEvent } from '@angular/common/http';
import { MerchandiseDTO } from '../../dtos/nex-level/merchandise';

export abstract class MerchandiseServiceInterface {
  abstract getMerchandiseDirectoryData(
    params?: string
  ): Observable<ResponseObjectDTO<PaginationDTO<MerchandiseDTO[]>>>;

  abstract getMerchandiseDirectoryDataByUuid(
    uuid: string
  ): Observable<ResponseObjectDTO<MerchandiseDTO>>;

  abstract storeMerchandiseDirectoryData(
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<MerchandiseDTO>>>;

  abstract updateMerchandiseDirectoryData(
    uuid: string,
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<MerchandiseDTO>>>;

  abstract updateIsPinnedData(
    uuid: string,
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<MerchandiseDTO>>>;

  abstract updateMerchandiseDirectoryDataStatus(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<MerchandiseDTO>>;

  abstract deleteMerchandiseDirectoryData(
    requestBody: object
  ): Observable<ResponseObjectDTO<MerchandiseDTO>>;
}
