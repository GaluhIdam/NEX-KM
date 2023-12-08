import { HttpParams } from '@angular/common/http';

export class HttpParamsUtil {
  generateHttpParams<T>(params: T): HttpParams {
    const object = params as Object;
    let httpParam = new HttpParams();

    const exclude: string[] = ['perPage', 'page'];

    Object.entries(object).find(([key, value]) => {
      if (!exclude.includes(key)) {
        httpParam = httpParam.append(key, value);
      }
    });

    return httpParam;
  }
}
