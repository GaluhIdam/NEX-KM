import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { PodcastCollaboratorDTO } from '../../dtos/nex-talk/podcast-collaborator.dto';

@Injectable()
export class PodcastCollaboratorDataService {
  constructor(private readonly _httpClient: HttpClient) {}

  storePodcastCollaboratorData(
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<PodcastCollaboratorDTO>>> {
    return this._httpClient.post<ResponseObjectDTO<PodcastCollaboratorDTO>>(
      `${environment.httpUrl}/v1/api/podcast/colaborator`,
      requestBody,
      { reportProgress: true, observe: 'events' }
    );
  }

  updatePodcastCollaboratorData(
    uuid: string,
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<PodcastCollaboratorDTO>>> {
    return this._httpClient.put<ResponseObjectDTO<PodcastCollaboratorDTO>>(
      `${environment.httpUrl}/v1/api/podcast/colaborator${uuid}`,
      requestBody,
      { reportProgress: true, observe: 'events' }
    );
  }

  deletePodcastCollaboratorData(
    uuid: string
  ): Observable<ResponseObjectDTO<PodcastCollaboratorDTO>> {
    return this._httpClient.delete<ResponseObjectDTO<PodcastCollaboratorDTO>>(
      `${environment.httpUrl}/v1/api/podcast/colaborator/${uuid}`
    );
  }
}
