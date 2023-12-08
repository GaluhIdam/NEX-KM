import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, lastValueFrom } from 'rxjs';
import { ResponseArrayDTO } from 'src/app/core/dtos/response.dto';
import { environment } from 'src/environments/environment.prod';
import { NexTeamDTO } from '../dtos/nex-team.dto';

@Injectable()
export class NexTeamService {
  constructor(private readonly _httpClient: HttpClient) {}

  getNexTeamData(params?: string): Observable<ResponseArrayDTO<NexTeamDTO[]>> {
    return this._httpClient.get<ResponseArrayDTO<NexTeamDTO[]>>(
      `${environment.httpUrl}/v1/api/nex-team?${params}`
    );
  }
}
