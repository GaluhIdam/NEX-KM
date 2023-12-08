import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import {
  ResponseArrayDTO,
  ResponseObjectDTO,
} from 'src/app/core/dtos/response.dto';
import { environment } from 'src/environments/environment.prod';
import {
  NotificationDTO,
  NotificationReadRequestDTO,
  NotificationRequestDTO,
} from '../dtos/notification.dto';

@Injectable({
  providedIn: 'root',
})
export class NotificationService extends BaseController {
  constructor(private http: HttpClient) {
    super(NotificationService.name);
  }

  //Notifications
  getAllNotifications(
    page: number,
    limit: number,
    search: string,
    sortBy: string
  ): Observable<ResponseArrayDTO<NotificationDTO[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('search', search)
      .set('sortBy', sortBy);
    return this.http
      .get<ResponseArrayDTO<NotificationDTO[]>>(
        environment.httpUrl + '/v1/api/' + 'notification',
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  getNotificationsByReceiver(
    page: number,
    limit: number,
    search: string,
    sortBy: string,
    personalNumber: string
  ): Observable<ResponseArrayDTO<NotificationDTO[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('search', search)
      .set('sortBy', sortBy);
    return this.http
      .get<ResponseArrayDTO<NotificationDTO[]>>(
        environment.httpUrl + '/v1/api/' + 'notification/' + personalNumber,
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  getNotificationByUuid(
    uuid: string
  ): Observable<ResponseObjectDTO<NotificationDTO>> {
    return this.http
      .get<ResponseObjectDTO<NotificationDTO>>(
        environment.httpUrl + '/v1/api/' + 'notification/' + uuid
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  createNotification(
    dto: NotificationRequestDTO
  ): Observable<ResponseObjectDTO<NotificationDTO>> {
    return this.http
      .post<ResponseObjectDTO<NotificationDTO>>(
        environment.httpUrl + '/v1/api/' + 'notification',
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  readNotification(
    uuid: string,
    dto: NotificationReadRequestDTO
  ): Observable<ResponseObjectDTO<NotificationDTO>> {
    return this.http
      .put<ResponseObjectDTO<NotificationDTO>>(
        environment.httpUrl + '/v1/api/' + 'notification/read/' + uuid,
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  readAllNotifications(
    dto: NotificationReadRequestDTO
  ): Observable<ResponseObjectDTO<NotificationDTO>> {
    return this.http
      .put<ResponseObjectDTO<NotificationDTO>>(
        environment.httpUrl + '/v1/api/' + 'notification/read-all-notif',
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  deleteNotification(
    uuid: string
  ): Observable<ResponseObjectDTO<NotificationDTO>> {
    return this.http
      .delete<ResponseObjectDTO<NotificationDTO>>(
        environment.httpUrl + '/v1/api/' + 'notification/' + uuid
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }
}
