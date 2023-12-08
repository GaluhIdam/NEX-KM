import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable, lastValueFrom } from 'rxjs';
import { Injectable } from '@angular/core';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import { WebDirectoryDTO } from '../../dtos/nex-library/web-directory.dto';
import { PaginationDTO } from '../../dtos/pagination.dto';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { WebDirectoryServiceInterface } from '../../interfaces/nex-library/web-directory.service.interface';

@Injectable()
export class WebDirectoryDataService implements WebDirectoryServiceInterface {
  constructor(private readonly _httpClient: HttpClient) {}

  getWebDirectoryData(
    params?: string
  ): Observable<ResponseObjectDTO<PaginationDTO<WebDirectoryDTO[]>>> {
    return this._httpClient.get<
      ResponseObjectDTO<PaginationDTO<WebDirectoryDTO[]>>
    >(`${environment.httpUrl}/v1/api/web-directory?${params}`);
  }

  getWebDirectoryDetailDataByUuid(
    uuid: string
  ): Observable<ResponseObjectDTO<WebDirectoryDTO>> {
    return this._httpClient.get<ResponseObjectDTO<WebDirectoryDTO>>(
      `${environment.httpUrl}/v1/api/web-directory/${uuid}`
    );
  }

  storeWebDirectoryData(
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<WebDirectoryDTO>>> {
    return this._httpClient.post<ResponseObjectDTO<WebDirectoryDTO>>(
      `${environment.httpUrl}/v1/api/web-directory`,
      requestBody,
      { reportProgress: true, observe: 'events' }
    );
  }

  updateWebDirectoryData(
    uuid: string,
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<WebDirectoryDTO>>> {
    return this._httpClient.put<ResponseObjectDTO<WebDirectoryDTO>>(
      `${environment.httpUrl}/v1/api/web-directory/${uuid}`,
      requestBody,
      { reportProgress: true, observe: 'events' }
    );
  }

  updateWebDirectoryStatus(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<WebDirectoryDTO>> {
    return this._httpClient.put<ResponseObjectDTO<WebDirectoryDTO>>(
      `${environment.httpUrl}/v1/api/web-directory/status/${uuid}`,
      requestBody
    );
  }
}
