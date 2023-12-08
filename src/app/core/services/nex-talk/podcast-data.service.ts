import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import { PaginationDTO } from '../../dtos/pagination.dto';
import { PodcastDTO } from '../../dtos/nex-talk/podcast.dto';
import { StatisticDTO } from '../../dtos/nex-talk/statistic.dto';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { PodcastServiceInterface } from '../../interfaces/nex-talk/podcast.service.interface';

@Injectable()
export class PodcastDataService implements PodcastServiceInterface {
  constructor(private readonly _httpClient: HttpClient) {}

  getPodcastData(
    params?: string
  ): Observable<ResponseObjectDTO<PaginationDTO<PodcastDTO[]>>> {
    return this._httpClient.get<ResponseObjectDTO<PaginationDTO<PodcastDTO[]>>>(
      `${environment.httpUrl}/v1/api/podcast?${params}`
    );
  }

  getPodcastStatiscticData(): Observable<ResponseObjectDTO<StatisticDTO>> {
    return this._httpClient.get<ResponseObjectDTO<StatisticDTO>>(
      `${environment.httpUrl}/v1/api/podcast/statistic`
    );
  }

  storePodcastData(
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<PodcastDTO>>> {
    return this._httpClient.post<ResponseObjectDTO<PodcastDTO>>(
      `${environment.httpUrl}/v1/api/podcast`,
      requestBody,
      { reportProgress: true, observe: 'events' }
    );
  }

  updatePodcastData(
    uuid: string,
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<PodcastDTO>>> {
    return this._httpClient.put<ResponseObjectDTO<PodcastDTO>>(
      `${environment.httpUrl}/v1/api/podcast/${uuid}`,
      requestBody,
      { reportProgress: true, observe: 'events' }
    );
  }

  getPodcastDetailByUuid(
    uuid: string
  ): Observable<ResponseObjectDTO<PodcastDTO>> {
    return this._httpClient.get<ResponseObjectDTO<PodcastDTO>>(
      `${environment.httpUrl}/v1/api/podcast/${uuid}`
    );
  }

  deletePodcastData(uuid: string): Observable<ResponseObjectDTO<PodcastDTO>> {
    return this._httpClient.delete<ResponseObjectDTO<PodcastDTO>>(
      `${environment.httpUrl}/v1/api/podcast/${uuid}`
    );
  }

  updatePodcastStatus(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<PodcastDTO>> {
    return this._httpClient.put<ResponseObjectDTO<PodcastDTO>>(
      `${environment.httpUrl}/v1/api/podcast/status/${uuid}`,
      requestBody
    );
  }

  updatePodcastEditorChoice(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<PodcastDTO>> {
    return this._httpClient.put<ResponseObjectDTO<PodcastDTO>>(
      `${environment.httpUrl}/v1/api/podcast/editor-choice/${uuid}`,
      requestBody
    );
  }

  updatePodcastStatusApproval(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<PodcastDTO>> {
    return this._httpClient.put<ResponseObjectDTO<PodcastDTO>>(
      `${environment.httpUrl}/v1/api/podcast/status-approval/${uuid}`,
      requestBody
    );
  }

  playPodcast(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<PodcastDTO>> {
    return this._httpClient.put<ResponseObjectDTO<PodcastDTO>>(
      `${environment.httpUrl}/v1/api/podcast/play/${uuid}`,
      requestBody
    );
  }

  getPodcastDurationFromUrl(url: string): Observable<number> {
    return new Observable<number>((observer) => {
      const audio = new Audio();
      audio.src = url;

      audio.addEventListener('loadedmetadata', () => {
        observer.next(audio.duration);
        observer.complete();
      });

      audio.addEventListener('error', (error) => {
        observer.error(error);
      });

      audio.load();
    });
  }
}
