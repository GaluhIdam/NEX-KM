import { HttpClient } from '@angular/common/http';
import { HttpService } from 'src/app/providers/http/http.service';
import { Observable, lastValueFrom } from 'rxjs';
import { Injectable } from '@angular/core';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import { EBookCategoryDTO } from '../../dtos/nex-library/ebook-category.dto';
import { PaginationDTO } from '../../dtos/pagination.dto';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { EBookCategoryServiceInterface } from '../../interfaces/nex-library/ebook-category.service.interface';

@Injectable()
export class EBookCategoryDataService implements EBookCategoryServiceInterface {
  constructor(private readonly _httpClient: HttpClient) {}

  getEBookCategoryData(
    params?: string
  ): Observable<ResponseObjectDTO<PaginationDTO<EBookCategoryDTO[]>>> {
    return this._httpClient.get<
      ResponseObjectDTO<PaginationDTO<EBookCategoryDTO[]>>
    >(`${environment.httpUrl}/v1/api/ebook-category?${params}`);
  }

  storeEbookCategoryData(
    requestBody: object
  ): Observable<ResponseObjectDTO<EBookCategoryDTO>> {
    return this._httpClient.post<ResponseObjectDTO<EBookCategoryDTO>>(
      `${environment.httpUrl}/v1/api/ebook-category`,
      requestBody
    );
  }

  updateEbookCategoryData(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<EBookCategoryDTO>> {
    return this._httpClient.put<ResponseObjectDTO<EBookCategoryDTO>>(
      `${environment.httpUrl}/v1/api/ebook-category/${uuid}`,
      requestBody
    );
  }

  updateEbookCategoryStatus(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<EBookCategoryDTO>> {
    return this._httpClient.put<ResponseObjectDTO<EBookCategoryDTO>>(
      `${environment.httpUrl}/v1/api/ebook-category/status/${uuid}`,
      requestBody
    );
  }
}
