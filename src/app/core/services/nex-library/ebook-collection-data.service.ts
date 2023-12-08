import { HttpClient } from '@angular/common/http';
import { HttpService } from 'src/app/providers/http/http.service';
import { Observable, lastValueFrom } from 'rxjs';
import { Injectable } from '@angular/core';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import { EBookDTO } from '../../dtos/nex-library/ebook.dto';
import { PaginationDTO } from '../../dtos/pagination.dto';
import { EBookCollectionDTO } from '../../dtos/nex-library/ebook-colllection.dto';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { EBookCollectionServiceInterface } from '../../interfaces/nex-library/ebook-collection.service.interface';

@Injectable()
export class EBookCollectionDataService
  implements EBookCollectionServiceInterface
{
  constructor(private readonly _httpClient: HttpClient) {}

  getEBookCollectionData(
    params?: string
  ): Observable<ResponseObjectDTO<PaginationDTO<EBookCollectionDTO[]>>> {
    return this._httpClient.get<
      ResponseObjectDTO<PaginationDTO<EBookCollectionDTO[]>>
    >(
      `${environment.httpUrl}/v1/api/ebook-collection-read/collection/?${params}`
    );
  }

  storeEbookCollectionData(
    requestBody: object
  ): Observable<ResponseObjectDTO<EBookCollectionDTO>> {
    return this._httpClient.post<ResponseObjectDTO<EBookCollectionDTO>>(
      `${environment.httpUrl}/v1/api/ebook-collection-read/collection`,
      requestBody
    );
  }
  checkEbookCollectionData(
    requestBody: object
  ): Observable<ResponseObjectDTO<EBookCollectionDTO>> {
    return this._httpClient.post<ResponseObjectDTO<EBookCollectionDTO>>(
      `${environment.httpUrl}/v1/api/ebook-collection-read/collection/check`,
      requestBody
    );
  }

  deleteEbookCollectionData(
    uuid: string
  ): Observable<ResponseObjectDTO<EBookCollectionDTO>> {
    return this._httpClient.delete<ResponseObjectDTO<EBookCollectionDTO>>(
      `${environment.httpUrl}/v1/api/ebook-collection-read/collection/${uuid}`
    );
  }
}
