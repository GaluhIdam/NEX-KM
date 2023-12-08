import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import { EBookDTO } from '../../dtos/nex-library/ebook.dto';
import { PaginationDTO } from '../../dtos/pagination.dto';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { EbookServiceInterface } from '../../interfaces/nex-library/ebook.service.interface';

@Injectable()
export class EBookDataService implements EbookServiceInterface {
  constructor(private readonly _httpClient: HttpClient) {}

  getEBookData(
    params?: string
  ): Observable<ResponseObjectDTO<PaginationDTO<EBookDTO[]>>> {
    return this._httpClient.get<ResponseObjectDTO<PaginationDTO<EBookDTO[]>>>(
      `${environment.httpUrl}/v1/api/ebook?${params}`
    );
  }

  getEBookDetailDataByUuid(
    uuid: string
  ): Observable<ResponseObjectDTO<EBookDTO>> {
    return this._httpClient.get<ResponseObjectDTO<EBookDTO>>(
      `${environment.httpUrl}/v1/api/ebook/${uuid}`
    );
  }

  storeEbookData(
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<EBookDTO>>> {
    return this._httpClient.post<ResponseObjectDTO<EBookDTO>>(
      `${environment.httpUrl}/v1/api/ebook`,
      requestBody,
      { reportProgress: true, observe: 'events' }
    );
  }

  updateData(
    uuid: string,
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<EBookDTO>>> {
    return this._httpClient.put<ResponseObjectDTO<EBookDTO>>(
      `${environment.httpUrl}/v1/api/ebook/${uuid}`,
      requestBody,
      { reportProgress: true, observe: 'events' }
    );
  }

  updateEbookStatus(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<EBookDTO>> {
    return this._httpClient.put<ResponseObjectDTO<EBookDTO>>(
      `${environment.httpUrl}/v1/api/ebook/status/${uuid}`,
      requestBody
    );
  }

  updateEbookEditorChoice(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<EBookDTO>> {
    return this._httpClient.put<ResponseObjectDTO<EBookDTO>>(
      `${environment.httpUrl}/v1/api/ebook/editor-choice/${uuid}`,
      requestBody
    );
  }

  updateEbookStatusApproval(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<EBookDTO>> {
    return this._httpClient.put<ResponseObjectDTO<EBookDTO>>(
      `${environment.httpUrl}/v1/api/ebook/status-approval/${uuid}`,
      requestBody
    );
  }

  updateViewEbook(uuid: string): Observable<ResponseObjectDTO<EBookDTO>> {
    return this._httpClient.put<ResponseObjectDTO<EBookDTO>>(
      `${environment.httpUrl}/v1/api/ebook/view/${uuid}`,
      {}
    );
  }
}
