import { Observable } from 'rxjs';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { PaginationDTO } from '../../dtos/pagination.dto';
import { StreamDTO } from '../../dtos/nex-talk/stream.dto';
import { StatisticDTO } from '../../dtos/nex-talk/statistic.dto';

export abstract class StreamServiceInterface {
  abstract getStreamData(
    params?: string
  ): Observable<ResponseObjectDTO<PaginationDTO<StreamDTO[]>>>;

  abstract getStreamStatiscticData(): Observable<
    ResponseObjectDTO<StatisticDTO>
  >;

  abstract getStreamDetailDataByUuid(
    uuid: string
  ): Observable<ResponseObjectDTO<StreamDTO>>;

  abstract updateStreamStatus(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<StreamDTO>>;

  abstract updateStreamEditorChoice(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<StreamDTO>>;

  abstract updateStreamStatusApproval(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<StreamDTO>>;
}
