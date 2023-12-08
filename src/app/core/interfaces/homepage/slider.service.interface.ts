import { Observable } from 'rxjs';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { HttpEvent } from '@angular/common/http';
import { PaginationDTO } from '../../dtos/pagination.dto';
import { SliderDTO } from '../../dtos/homepage/slider';

export abstract class SliderServiceInterface {
  abstract getSliderData(
    params?: string
  ): Observable<ResponseObjectDTO<PaginationDTO<SliderDTO[]>>>;

  abstract getSliderDataByUuid(
    uuid: string
  ): Observable<ResponseObjectDTO<SliderDTO>>;

  abstract storeSliderData(
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<SliderDTO>>>;

  abstract updateSliderData(
    uuid: string,
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<SliderDTO>>>;

  abstract updateSliderDataStatus(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<SliderDTO>>;

  abstract deleteSliderData(
    requestBody: object
  ): Observable<ResponseObjectDTO<SliderDTO>>;
}
