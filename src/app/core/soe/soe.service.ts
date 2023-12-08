import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SoeAllDTO, SoeBodyAllDTO, SoeDTO, SoeDetailDTO } from './soe.dto';
import { environment } from 'src/environments/environment.prod';
import { BaseController } from '../BaseController/base-controller';

@Injectable({
  providedIn: 'root',
})
export class SoeService extends BaseController {
  constructor(private http: HttpClient) {
    super(SoeService.name);
  }
  headers = new HttpHeaders().set('x-api-key', '343C-ED0B-4137-B27E');

  //Get User by Personal Number
  getUserData(personal_number: any): Observable<SoeDTO> {
    new HttpParams().set('personal_number', personal_number);
    return this.http
      .get<SoeDetailDTO>(environment.soeUrl + personal_number, {
        headers: this.headers,
      })
      .pipe(
        map((response) => {
          return response.body;
        })
      );
  }

  //Get All User
  getAllUser(): Observable<SoeDTO[]> {
    const params = new HttpParams()
      .set('page', 1)
      .set('perPage', 10)
      .set('orderColumn', 'personalName')
      .set('orderBy', 'asc');
    return this.http
      .get<SoeBodyAllDTO>(environment.soeUrl, {
        params: params,
        headers: this.headers,
      })
      .pipe(
        map((response) => {
          return response.body.data;
        }),
        catchError(this.handleError)
      );
  }

  getUserByName(personalName: string): Observable<SoeDTO[]> {
    const params = new HttpParams()
      .set('page', 1)
      .set('perPage', 10)
      .set('orderColumn', 'personalName')
      .set('searchTerm', personalName);
    return this.http
      .get<SoeBodyAllDTO>(environment.soeUrl, {
        params: params,
        headers: this.headers,
      })
      .pipe(
        map((response) => {
          return response.body.data;
        }),
        catchError(this.handleError)
      );
  }
}
