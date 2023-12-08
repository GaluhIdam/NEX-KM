import { Observable } from 'rxjs';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { PaginationDTO } from '../../dtos/pagination.dto';
import { StatisticDTO } from '../../dtos/nex-talk/statistic.dto';
import { PodcastDTO } from '../../dtos/nex-talk/podcast.dto';

export abstract class PodcastServiceInterface {
  abstract getPodcastData(
    params?: string
  ): Observable<ResponseObjectDTO<PaginationDTO<PodcastDTO[]>>>;

  abstract getPodcastStatiscticData(): Observable<
    ResponseObjectDTO<StatisticDTO>
  >;

  abstract updatePodcastStatus(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<PodcastDTO>>;

  abstract updatePodcastEditorChoice(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<PodcastDTO>>;

  abstract updatePodcastStatusApproval(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<PodcastDTO>>;

  abstract playPodcast(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<PodcastDTO>>;
}
