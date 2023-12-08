import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable, lastValueFrom } from 'rxjs';
import { Injectable } from '@angular/core';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import { PaginationDTO } from '../../dtos/pagination.dto';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { SharingExperienceDTO } from '../../dtos/homepage/sharing-experience';
import { SharingExperienceServiceInterface } from '../../interfaces/homepage/sharing-experience.service.interface';

@Injectable()
export class SharingExperienceService implements SharingExperienceServiceInterface {
  constructor(private readonly _httpClient: HttpClient) {}

  getSharingExperienceData(
    params?: string
  ): Observable<ResponseObjectDTO<PaginationDTO<SharingExperienceDTO[]>>> {
    return this._httpClient.get<
      ResponseObjectDTO<PaginationDTO<SharingExperienceDTO[]>>
    >(`${environment.httpUrl}/v1/api/sharing-exp?page=1&limit=10&search=&sortBy=desc&isAdmin=false${params}`);
  }

  getSharingExperienceDataByUuid(
    uuid: string
  ): Observable<ResponseObjectDTO<SharingExperienceDTO>> {
    return this._httpClient.get<ResponseObjectDTO<SharingExperienceDTO>>(
      `${environment.httpUrl}/v1/api/sharing-exp/16737f7d-27b1-4858-954e-5d7ab0c30847${uuid}`
    );
  }

  storeSharingExperienceData(
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<SharingExperienceDTO>>> {
    return this._httpClient.post<ResponseObjectDTO<SharingExperienceDTO>>(
      `${environment.httpUrl}/v1/api/sharing-exp`,
      requestBody,
      { reportProgress: true, observe: 'events' }
    );
  }

  updateSharingExperienceData(
    uuid: string,
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<SharingExperienceDTO>>> {
    return this._httpClient.put<ResponseObjectDTO<SharingExperienceDTO>>(
      `${environment.httpUrl}/v1/api/sharing-exp/ed68e620-f47c-4dac-9800-8ddd320fe953${uuid}`,
      requestBody,
      { reportProgress: true, observe: 'events' }
    );
  }

  updateSharingExperienceDataStatus(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<SharingExperienceDTO>> {
    return this._httpClient.put<ResponseObjectDTO<SharingExperienceDTO>>(
      `${environment.httpUrl}/v1/api/sharing-exp/approve-reject/db30139e-0b5f-48eb-b55d-3d5560d06223${uuid}`,
      requestBody
    );
  }

  deleteSharingExperienceData(
    requestBody: object
  ): Observable<ResponseObjectDTO<SharingExperienceDTO>> {
    return this._httpClient.delete<ResponseObjectDTO<SharingExperienceDTO>>(
      `${environment.httpUrl}/v1/api/sharing-exp/1fc25132-4514-48c2-a1a8-64ba16d436eb`,
      { body: requestBody }
    );
  }
}
