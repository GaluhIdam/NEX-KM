import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { Observable, catchError, map } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { BaseController } from '../../BaseController/base-controller';
import { ResponseSocketDTO } from './socket.dto';
import { NotificationRequestDTO } from 'src/app/pages/user/home-page/dtos/notification.dto';
import { KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root',
})
export class SocketService extends BaseController {
  private socket: any;
  notificationSocket: any;

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakService
  ) {
    super(SocketService.name);
  }

  connectSocket(): Observable<ResponseSocketDTO> {
    this.socket = io(environment.channelUrlSocketConnect);
    return new Observable((observer) => {
      this.socket.on('connect', () => {
        observer.next();
        console.log('Connected.');
      });
      this.socket.on('notification/test/nex-km', (data: ResponseSocketDTO) => {
        if (data.data.receiverPersonalNumber === this.keycloakService.getUsername()) {
          observer.next(data);
          return () => this.socket.disconnect();
        } else {
          return () => this.socket.disconnect();
        }
      });
    });
  }

  sendSocket(data: NotificationRequestDTO): Observable<ResponseSocketDTO> {
    const params = new HttpParams().set('channel', environment.channel);
    return this.http
      .post<ResponseSocketDTO>(environment.channelUrlSocketSend, data, {
        params: params,
      })
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }
}
