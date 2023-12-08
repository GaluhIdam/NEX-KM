import { Observable } from 'rxjs';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { PaginationDTO } from '../../dtos/pagination.dto';
import { SerieDTO } from '../../dtos/nex-talk/serie.dto';
import { StatisticDTO } from '../../dtos/nex-talk/statistic.dto';
import { HttpEvent } from '@angular/common/http';

export abstract class SerieServiceInterface {
  abstract getSerieData(
    params?: string
  ): Observable<ResponseObjectDTO<PaginationDTO<SerieDTO[]>>>;

  abstract getSerieStatiscticData(): Observable<
    ResponseObjectDTO<StatisticDTO>
  >;

  abstract storeSerieData(
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<SerieDTO>>>;

  abstract updateSerieStatus(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<SerieDTO>>;

  abstract updateSerieEditorChoice(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<SerieDTO>>;

  abstract updateSerieStatusApproval(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<SerieDTO>>;
}
