import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable(
  {
    providedIn: 'root'
  }
)

export class HeaderService {

  constructor(private http: HttpClient) { }
  headers = new HttpHeaders()
    .set('x-api-key', '343C-ED0B-4137-B27E');

  getUserData(personal_number: any): Observable<any> {
    new HttpParams()
      .set('personal_number', personal_number);
    return this.http.get('https://api.gmf-aeroasia.co.id/th/soe/v1/employee/' + personal_number, { headers: this.headers })
      .pipe(
        map((response) => {
          return response;
        }),
        catchError((error) => {
          console.log(error)
          throw error
        })
      )
  }
}
