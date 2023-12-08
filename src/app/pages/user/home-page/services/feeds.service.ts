import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import { ResponseArrayDTO } from 'src/app/core/dtos/response.dto';
import { environment } from 'src/environments/environment.prod';
import { FeedsDTO } from '../dtos/feeds.dto';

@Injectable({
  providedIn: 'root'
})
export class FeedsService extends BaseController {

  constructor(private http: HttpClient) {
    super(FeedsService.name);
  }
  getFeedsByPersonalNumber(
    page: number,
    limit: number,
    search: string,
    sortBy: string,
    personalNumber: string
  ): Observable<ResponseArrayDTO<FeedsDTO[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('search', search)
      .set('sortBy', sortBy)
      .set('personalNumber', personalNumber);
    return this.http
      .get<ResponseArrayDTO<FeedsDTO[]>>(
        environment.httpUrl + '/v1/api/' + '',
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }
}
