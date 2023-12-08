import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParamsUtil } from 'src/app/core/utils/http-params.util';
import { environment } from 'src/environments/environment.prod';

export abstract class HttpService<T> {
  http: HttpClient;
  httpParamUtil: HttpParamsUtil;

  constructor(client: HttpClient) {
    this.http = client;
    this.httpParamUtil = new HttpParamsUtil();
  }

  get<T, U extends any>(url: string, httpParams?: T): Observable<U> {
    if (httpParams) {
      return this.http.post<U>(`${url}`, httpParams);
    } else {
      return this.http.get<U>(`${url}`);
    }
  }

  getWithoutParam<T>(url: string): Observable<any> {
    return this.http.get<T>(`${environment.httpUrl}${url}`);
  }

  getCustomUrls<T, U extends any>(url: string): Observable<U> {
    return this.http.get<U>(`${url}`);
  }

  getCustomUrl<T>(url: string): Observable<any> {
    return this.http.get<T>(`${url}`);
  }

  getCustomUrlWithHeader<T>(
    url: string,
    headers: HttpHeaders
  ): Observable<any> {
    return this.http.get<T>(`${url}`, { headers });
  }

  feedbackUrl<T>(
    url: string,
    requestBody: T,
    headers: HttpHeaders
  ): Observable<any> {
    return this.http.post<T>(`${url}`, requestBody, { headers });
  }

  post2<T>(url: string, requestBody: T): Observable<any> {
    return this.http.post<T>(`${url}`, requestBody);
  }

  post<T>(url: string, requestBody: T): Observable<any> {
    return this.http.post<T>(`${url}`, { object: requestBody });
  }

  put<T>(url: string, requestBody: T): Observable<any> {
    return this.http.put<T>(`${url}`, requestBody);
  }

  delete<T>(url: string): Observable<any> {
    return this.http.delete<T>(`${url}`);
  }

  delete2<T>(url: string, requestBody: T): Observable<any> {
    return this.http.delete<T>(`${url}`, { body: requestBody });
  }

  delete3<T>(url: string, requestBody: T): Observable<any> {
    return this.http.put<T>(`${url}`, requestBody);
  }

  patch<T>(url: string, id: number, requestBody: T): Observable<any> {
    return this.http.patch<T>(
      `${environment.httpUrl}${url}/${id}`,
      requestBody
    );
  }

  show<T, U extends any>(url: string, httpParams?: T): Observable<U> {
    let params: HttpParams = <HttpParams>{};

    if (httpParams) {
      params = this.httpParamUtil.generateHttpParams(httpParams as object);
    }
    return this.http.get<U>(`${url}`);
  }
}
