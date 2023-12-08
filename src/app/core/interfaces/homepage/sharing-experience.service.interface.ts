import { Observable } from 'rxjs';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { HttpEvent } from '@angular/common/http';
import { PaginationDTO } from '../../dtos/pagination.dto';
import { SharingExperienceDTO } from '../../dtos/homepage/sharing-experience';

export abstract class SharingExperienceServiceInterface {
  abstract getSharingExperienceData(
    params?: string
  ): Observable<ResponseObjectDTO<PaginationDTO<SharingExperienceDTO[]>>>;

  abstract getSharingExperienceDataByUuid(
    uuid: string
  ): Observable<ResponseObjectDTO<SharingExperienceDTO>>;

  abstract storeSharingExperienceData(
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<SharingExperienceDTO>>>;

  abstract updateSharingExperienceData(
    uuid: string,
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<SharingExperienceDTO>>>;

  abstract updateSharingExperienceDataStatus(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<SharingExperienceDTO>>;

  abstract deleteSharingExperienceData(
    requestBody: object
  ): Observable<ResponseObjectDTO<SharingExperienceDTO>>;
}
