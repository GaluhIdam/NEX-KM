import { HttpClient, HttpEvent, HttpParams } from '@angular/common/http';
import { Observable, catchError, lastValueFrom, map } from 'rxjs';
import { Injectable } from '@angular/core';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import { PaginationDTO } from '../../dtos/pagination.dto';
import { ResponseArrayDTO, ResponseObjectDTO } from '../../dtos/response.dto';
import { NexTeamServiceInterface } from '../../interfaces/homepage/nex-team.service.interface';
import { NexTeamCreateDTO, NexTeamDTO, NexTeamUpdateDTO } from '../../dtos/homepage/nex_team';
import { BaseController } from '../../BaseController/base-controller';
import { SoeService } from '../../soe/soe.service';
import { UserListDTO } from '../../dtos/homepage/user_list';

@Injectable()
export class NexTeamService extends BaseController  {
  constructor(
    private http: HttpClient,
    private readonly soeService: SoeService
  ) {
    super(NexTeamService.name);
  }

  getUserList(
    page: number,
    limit: number,
    search: string,
    sortBy: string
  ): Observable<ResponseArrayDTO<UserListDTO[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('search', search)
      .set('sortBy', sortBy);
    return this.http
      .get<ResponseArrayDTO<UserListDTO[]>>(
        environment.httpUrl + '/v1/api/' + 'user-list/',
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  getNexTeam(
    page: number,
    limit: number,
    search: string,
    sortBy: string
  ): Observable<ResponseArrayDTO<NexTeamDTO[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('search', search)
      .set('sortBy', sortBy);
    return this.http
      .get<ResponseArrayDTO<NexTeamDTO[]>>(
        environment.httpUrl + '/v1/api/' + 'nex-team/',
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  getNexTeamByUuid(
    uuid: string
  ): Observable<ResponseObjectDTO<NexTeamDTO>> {
    return this.http
      .get<ResponseObjectDTO<NexTeamDTO>>(
        environment.httpUrl + '/v1/api/' + 'nex-team/detail-team/' + uuid
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  createNexTeam(
    dto: NexTeamCreateDTO
  ): Observable<ResponseObjectDTO<NexTeamCreateDTO>> {
    return this.http
      .post<ResponseObjectDTO<NexTeamCreateDTO>>(
        environment.httpUrl + '/v1/api/' + 'nex-team/',
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  updateNexTeam(
    personnelNumber: string,
    dto: NexTeamUpdateDTO
  ): Observable<ResponseObjectDTO<NexTeamUpdateDTO>> {
    return this.http
      .put<ResponseObjectDTO<NexTeamUpdateDTO>>(
        environment.httpUrl + '/v1/api/' + 'nex-team/' + personnelNumber,
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  deleteNexTeam(
    uuid: string
  ): Observable<ResponseObjectDTO<NexTeamCreateDTO>> {
    return this.http
      .delete<ResponseObjectDTO<NexTeamCreateDTO>>(
        environment.httpUrl + '/v1/api/' + 'nex-team/' + uuid
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }
}
