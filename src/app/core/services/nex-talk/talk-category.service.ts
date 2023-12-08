import { HttpClient } from '@angular/common/http';
import { HttpService } from 'src/app/providers/http/http.service';
import { Observable, lastValueFrom } from 'rxjs';
import { Injectable } from '@angular/core';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import { PaginationDTO } from '../../dtos/pagination.dto';
import { TalkCategoryDTO } from '../../dtos/nex-talk/talk-category.dto';

export type ResponseMaster<U extends string, T> = Record<U, T>;

@Injectable()
export class TalkCategoryDataService extends HttpService<TalkCategoryDTO> {
  constructor(private readonly _httpClient: HttpClient) {
    super(_httpClient);
  }

  getTalkCategoryData(
    params?: string
  ): Observable<ResponseMaster<'data', PaginationDTO<TalkCategoryDTO[]>>> {
    return this.get<
      any,
      ResponseMaster<'data', PaginationDTO<TalkCategoryDTO[]>>
    >(`${environment.httpUrl}/v1/api/talk-category?${params}`);
  }

  storeTalkCategoryData(requestBody: object): Observable<any> {
    return this.post2(
      `${environment.httpUrl}/v1/api/talk-category`,
      requestBody
    );
  }

  updateTalkCategoryData(uuid: string, requestBody: object): Observable<any> {
    return this.put(
      `${environment.httpUrl}/v1/api/talk-category/${uuid}`,
      requestBody
    );
  }

  updateTalkCategoryStatus(uuid: string, requestBody: object): Observable<any> {
    return this.put(
      `${environment.httpUrl}/v1/api/talk-category/status/${uuid}`,
      requestBody
    );
  }
}
