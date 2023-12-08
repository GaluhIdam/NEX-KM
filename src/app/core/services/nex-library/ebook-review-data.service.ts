import { HttpClient } from '@angular/common/http';
import { HttpService } from 'src/app/providers/http/http.service';
import { Observable, lastValueFrom } from 'rxjs';
import { Injectable } from '@angular/core';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import { EBookReviewDTO } from '../../dtos/nex-library/ebook-review.dto';
import { PaginationDTO } from '../../dtos/pagination.dto';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { EBookReviewServiceInterface } from '../../interfaces/nex-library/ebook-review.service.interface';

@Injectable()
export class EBookReviewDataService implements EBookReviewServiceInterface {
  constructor(private readonly _httpClient: HttpClient) {}

  getEBookReviewData(
    params?: string
  ): Observable<ResponseObjectDTO<PaginationDTO<EBookReviewDTO[]>>> {
    return this._httpClient.get<
      ResponseObjectDTO<PaginationDTO<EBookReviewDTO[]>>
    >(`${environment.httpUrl}/v1/api/ebook-review?${params}`);
  }

  storeEbookReviewData(
    requestBody: object
  ): Observable<ResponseObjectDTO<EBookReviewDTO>> {
    return this._httpClient.post<ResponseObjectDTO<EBookReviewDTO>>(
      `${environment.httpUrl}/v1/api/ebook-review`,
      requestBody
    );
  }
}
