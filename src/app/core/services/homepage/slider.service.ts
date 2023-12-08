import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable, lastValueFrom } from 'rxjs';
import { Injectable } from '@angular/core';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import { PaginationDTO } from '../../dtos/pagination.dto';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { SliderDTO } from '../../dtos/homepage/slider';
import { SliderServiceInterface } from '../../interfaces/homepage/slider.service.interface';

@Injectable()
export class SliderService implements SliderServiceInterface {
  constructor(private readonly _httpClient: HttpClient) {}

  getSliderData(
    params?: string
  ): Observable<ResponseObjectDTO<PaginationDTO<SliderDTO[]>>> {
    return this._httpClient.get<
      ResponseObjectDTO<PaginationDTO<SliderDTO[]>>
    >(`${environment.httpUrl}/v1/api/merchandise?${params}`);
  }

  getSliderDataByUuid(
    uuid: string
  ): Observable<ResponseObjectDTO<SliderDTO>> {
    return this._httpClient.get<ResponseObjectDTO<SliderDTO>>(
      `${environment.httpUrl}/v1/api/merchandise/${uuid}`
    );
  }

  storeSliderData(
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<SliderDTO>>> {
    return this._httpClient.post<ResponseObjectDTO<SliderDTO>>(
      `${environment.httpUrl}/v1/api/merchandise`,
      requestBody,
      { reportProgress: true, observe: 'events' }
    );
  }

  updateSliderData(
    uuid: string,
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<SliderDTO>>> {
    return this._httpClient.put<ResponseObjectDTO<SliderDTO>>(
      `${environment.httpUrl}/v1/api/merchandise/${uuid}`,
      requestBody,
      { reportProgress: true, observe: 'events' }
    );
  }

  updateSliderDataStatus(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<SliderDTO>> {
    return this._httpClient.put<ResponseObjectDTO<SliderDTO>>(
      `${environment.httpUrl}/v1/api/merchandise/status/${uuid}`,
      requestBody
    );
  }

  deleteSliderData(
    requestBody: object
  ): Observable<ResponseObjectDTO<SliderDTO>> {
    return this._httpClient.delete<ResponseObjectDTO<SliderDTO>>(
      `${environment.httpUrl}/v1/api/merchandise`,
      { body: requestBody }
    );
  }
}
