import { Observable } from 'rxjs';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { PaginationDTO } from '../../dtos/pagination.dto';
import { ForumDTO } from '../../dtos/nex-talk/forum.dto';
import { StatisticDTO } from '../../dtos/nex-talk/statistic.dto';

export abstract class ForumServiceInterface {
  abstract getForumData(
    params?: string
  ): Observable<ResponseObjectDTO<PaginationDTO<ForumDTO[]>>>;

  abstract getForumStatiscticData(): Observable<
    ResponseObjectDTO<StatisticDTO>
  >;

  abstract getForumDetailDataByUuid(
    uuid: string
  ): Observable<ResponseObjectDTO<ForumDTO>>;

  abstract updateForumStatus(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<ForumDTO>>;

  abstract updateForumEditorChoice(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<ForumDTO>>;

  abstract updateForumStatusApproval(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<ForumDTO>>;

  abstract deleteForumData(
    uuid: string
  ): Observable<ResponseObjectDTO<ForumDTO>>;
}
