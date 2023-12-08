import { Observable } from 'rxjs';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { HttpEvent } from '@angular/common/http';
import { PaginationDTO } from '../../dtos/pagination.dto';
import { NexTeamDTO } from '../../dtos/homepage/nex_team';

export abstract class NexTeamServiceInterface {
  abstract getNexTeamData(
    params?: string
  ): Observable<ResponseObjectDTO<PaginationDTO<NexTeamDTO[]>>>;

  abstract getNexTeamDataByUuid(
    uuid: string
  ): Observable<ResponseObjectDTO<NexTeamDTO>>;

  abstract storeNexTeamData(
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<NexTeamDTO>>>;

  abstract updateNexTeamData(
    uuid: string,
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<NexTeamDTO>>>;

  abstract updateNexTeamDataStatus(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<NexTeamDTO>>;

  abstract deleteNexTeamData(
    requestBody: object
  ): Observable<ResponseObjectDTO<NexTeamDTO>>;
}
