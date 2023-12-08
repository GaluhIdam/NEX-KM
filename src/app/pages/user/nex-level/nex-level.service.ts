import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import {
  ResponseArrayDTO,
  ResponseObjectDTO,
} from 'src/app/core/dtos/response.dto';
import {
  MerchandiseCreateDTO,
  MerchandiseDTO,
  MerchandiseImageDTO,
  MerchandiseImageUpdateDTO,
  MerchandisePinDTO,
} from './dtos/merchandise.dto';
import { environment } from 'src/environments/environment.prod';
import { MileCreateDTO, MileDTO } from './dtos/mile.dto';
import { PointConfigCreateDTO, PointConfigDTO } from './dtos/point-config.dto';
import { RedeemCreateDTO, RedeemDTO, RedeemUpdateDTO } from './dtos/redeem.dto';
import { LoginDTO, PointCreateDTO, PointDTO } from './dtos/point.dto';
import { UserDTO } from '../nex-learning/dtos/user.dto';

@Injectable({
  providedIn: 'root',
})
export class NexLevelService extends BaseController {
  constructor(private http: HttpClient) {
    super(NexLevelService.name);
  }

  private headers = new HttpHeaders().set('x-api-key', '343C-ED0B-4137-B27E');

  //Merchandise

  filterMerchandise(
    page: number,
    limit: number,
    search: string,
    sortBy: string,
    minPoint: number,
    maxPoint: number
  ): Observable<ResponseArrayDTO<MerchandiseDTO[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('search', search)
      .set('sortBy', sortBy)
      .set('minPoint', minPoint)
      .set('maxPoint', maxPoint);
    return this.http
      .get<ResponseArrayDTO<MerchandiseDTO[]>>(
        environment.httpUrl + '/v1/api/' + 'merchandise/filter',
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  getMerchandise(
    page: number,
    limit: number,
    search: string,
    sortBy: string
  ): Observable<ResponseArrayDTO<MerchandiseDTO[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('search', search)
      .set('sortBy', sortBy);
    return this.http
      .get<ResponseArrayDTO<MerchandiseDTO[]>>(
        environment.httpUrl + '/v1/api/' + 'merchandise/',
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  getMerchandiseByUuid(
    uuid: string
  ): Observable<ResponseObjectDTO<MerchandiseDTO>> {
    return this.http
      .get<ResponseObjectDTO<MerchandiseDTO>>(
        environment.httpUrl + '/v1/api/' + 'merchandise/' + uuid
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  createMerchandise(
    dto: MerchandiseCreateDTO
  ): Observable<ResponseObjectDTO<MerchandiseDTO>> {
    return this.http
      .post<ResponseObjectDTO<MerchandiseDTO>>(
        environment.httpUrl + '/v1/api/' + 'merchandise',
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  updateMerchandise(
    uuid: string,
    dto: MerchandiseCreateDTO
  ): Observable<ResponseObjectDTO<MerchandiseDTO>> {
    return this.http
      .put<ResponseObjectDTO<MerchandiseDTO>>(
        environment.httpUrl + '/v1/api/' + 'merchandise/' + uuid,
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  deleteMerchandise(
    uuid: string
  ): Observable<ResponseObjectDTO<MerchandiseDTO>> {
    return this.http
      .delete<ResponseObjectDTO<MerchandiseDTO>>(
        environment.httpUrl + '/v1/api/' + 'merchandise/' + uuid
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  pinUnpinMerchandise(
    uuid: string,
    dto: MerchandisePinDTO
  ): Observable<MerchandiseDTO> {
    return this.http
      .put<MerchandiseDTO>(
        environment.httpUrl + '/v1/api/' + 'merchandise/' + uuid,
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Image Merchandise
  createImageMerchandise(
    dto: MerchandiseImageDTO
  ): Observable<MerchandiseImageDTO> {
    const formData = new FormData();
    formData.append('image', dto.image);
    formData.append('personalNumber', `${dto.personalNumber}`);
    formData.append('merchandiseId', `${dto.merchandiseId}`);
    return this.http
      .post<MerchandiseImageDTO>(
        environment.httpUrl + '/v1/api/merchandise/image',
        formData
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  deleteImageMerchandise(uuid: string): Observable<MerchandiseImageDTO> {
    return this.http
      .delete<MerchandiseImageDTO>(
        environment.httpUrl + '/v1/api/merchandise/image/' + uuid
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Mile
  getAllMile(): Observable<ResponseArrayDTO<MileDTO[]>> {
    return this.http
      .get<ResponseArrayDTO<MileDTO[]>>(
        environment.httpUrl + '/v1/api/' + 'miles/all'
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  getMile(
    page: number,
    limit: number,
    search: string,
    sortBy: string
  ): Observable<ResponseArrayDTO<MileDTO[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('search', search)
      .set('sortBy', sortBy);
    return this.http
      .get<ResponseArrayDTO<MileDTO[]>>(
        environment.httpUrl + '/v1/api/' + 'miles/',
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  getMileByUuid(uuid: string): Observable<ResponseObjectDTO<MileDTO>> {
    return this.http
      .get<ResponseObjectDTO<MileDTO>>(
        environment.httpUrl + '/v1/api/' + 'miles/' + uuid
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  createMile(dto: MileCreateDTO): Observable<ResponseObjectDTO<MileDTO>> {
    const formData = new FormData();
    formData.append('image', dto.image);
    formData.append('level', `${dto.level}`);
    formData.append('category', `${dto.category}`);
    formData.append('personalNumber', `${dto.personalNumber}`);
    formData.append('name', `${dto.name}`);
    formData.append('minPoint', `${dto.minPoint}`);
    formData.append('maxPoint', `${dto.maxPoint}`);
    formData.append('status', `${dto.status}`);
    return this.http
      .post<ResponseObjectDTO<MileDTO>>(
        environment.httpUrl + '/v1/api/' + 'miles',
        formData
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  updateMile(
    uuid: string,
    dto: MileCreateDTO
  ): Observable<ResponseObjectDTO<MileDTO>> {
    const formData = new FormData();
    formData.append('image', dto.image);
    formData.append('level', `${dto.level}`);
    formData.append('category', `${dto.category}`);
    formData.append('personalNumber', `${dto.personalNumber}`);
    formData.append('name', `${dto.name}`);
    formData.append('minPoint', `${dto.minPoint}`);
    formData.append('maxPoint', `${dto.maxPoint}`);
    formData.append('status', `${dto.status}`);
    return this.http
      .put<ResponseObjectDTO<MileDTO>>(
        environment.httpUrl + '/v1/api/' + 'miles/' + uuid,
        formData
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  deleteMile(uuid: string): Observable<ResponseObjectDTO<MileDTO>> {
    return this.http
      .delete<ResponseObjectDTO<MileDTO>>(
        environment.httpUrl + '/v1/api/' + 'miles/' + uuid
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Point Config
  getPointConfig(
    page: number,
    limit: number,
    search: string,
    sortBy: string
  ): Observable<ResponseArrayDTO<PointConfigDTO[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('search', search)
      .set('sortBy', sortBy);
    return this.http
      .get<ResponseArrayDTO<PointConfigDTO[]>>(
        environment.httpUrl + '/v1/api/' + 'point-config/',
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  getPointConfigByUuid(
    uuid: string
  ): Observable<ResponseObjectDTO<PointConfigCreateDTO>> {
    return this.http
      .get<ResponseObjectDTO<PointConfigCreateDTO>>(
        environment.httpUrl + '/v1/api/' + 'point-config/' + uuid
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  createPointConfig(
    dto: PointConfigCreateDTO
  ): Observable<ResponseObjectDTO<PointConfigCreateDTO>> {
    return this.http
      .post<ResponseObjectDTO<PointConfigCreateDTO>>(
        environment.httpUrl + '/v1/api/' + 'point-config/',
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  updatePointConfig(
    uuid: string,
    dto: PointConfigCreateDTO
  ): Observable<ResponseObjectDTO<PointConfigCreateDTO>> {
    return this.http
      .put<ResponseObjectDTO<PointConfigCreateDTO>>(
        environment.httpUrl + '/v1/api/' + 'point-config/' + uuid,
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  deletePointConfig(
    uuid: string
  ): Observable<ResponseObjectDTO<PointConfigCreateDTO>> {
    return this.http
      .delete<ResponseObjectDTO<PointConfigCreateDTO>>(
        environment.httpUrl + '/v1/api/' + 'point-config/' + uuid
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Get User
  getUser(personalNumber: number | string): Observable<UserDTO> {
    return this.http
      .get<UserDTO>(environment.soeUrl + personalNumber, {
        headers: this.headers,
      })
      .pipe(
        map((response: any) => {
          return response.body;
        }),
        catchError(this.handleError)
      );
  }

  //Redeem
  getRedeem(
    page: number,
    limit: number,
    search: string,
    sortBy: string
  ): Observable<ResponseArrayDTO<RedeemDTO[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('search', search)
      .set('sortBy', sortBy);
    return this.http
      .get<ResponseArrayDTO<RedeemDTO[]>>(
        environment.httpUrl + '/v1/api/' + 'redeem/',
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  getRedeemByPersonalNumber(
    page: number,
    limit: number,
    search: string,
    sortBy: string,
    personalNumber: string
  ): Observable<ResponseArrayDTO<RedeemDTO[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('search', search)
      .set('sortBy', sortBy)
      .set('personalNumber', personalNumber);
    return this.http
      .get<ResponseArrayDTO<RedeemDTO[]>>(
        environment.httpUrl + '/v1/api/' + 'redeem/by-user',
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  getRedeemByUuid(uuid: string): Observable<ResponseObjectDTO<RedeemDTO>> {
    return this.http
      .get<ResponseObjectDTO<RedeemDTO>>(
        environment.httpUrl + '/v1/api/' + 'redeem/' + uuid
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  createRedeem(dto: RedeemCreateDTO): Observable<ResponseObjectDTO<RedeemDTO>> {
    return this.http
      .post<ResponseObjectDTO<RedeemDTO>>(
        environment.httpUrl + '/v1/api/' + 'redeem',
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  createRedeemByPersonalNumber(dto: RedeemCreateDTO): Observable<ResponseObjectDTO<RedeemDTO>> {
    return this.http
      .post<ResponseObjectDTO<RedeemDTO>>(
        environment.httpUrl + '/v1/api/' + 'redeem/by-user',
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  updateRedeem(
    uuid: string,
    dto: RedeemUpdateDTO
  ): Observable<ResponseObjectDTO<RedeemDTO>> {
    return this.http
      .put<ResponseObjectDTO<RedeemDTO>>(
        environment.httpUrl + '/v1/api/' + 'redeem/' + uuid,
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  deleteRedeem(uuid: string): Observable<ResponseObjectDTO<RedeemDTO>> {
    return this.http
      .delete<ResponseObjectDTO<RedeemDTO>>(
        environment.httpUrl + '/v1/api/' + 'redeem/' + uuid
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //history point admin
  getHistoryPoint(
    page: number,
    limit: number,
    search: string,
    sortBy: string
  ): Observable<ResponseArrayDTO<PointConfigDTO[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('search', search)
      .set('sortBy', sortBy);
    return this.http
      .get<ResponseArrayDTO<PointConfigDTO[]>>(
        environment.httpUrl + '/v1/api/' + 'point/history-point',
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  // history point user
  getHistoryPointByPersonalNumber(
    page: number,
    limit: number,
    search: string,
    sortBy: string,
    personalNumber: string,
    year: string
  ): Observable<ResponseArrayDTO<PointConfigDTO[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('search', search)
      .set('sortBy', sortBy)
      .set('personalNumber', personalNumber)
      .set('year', year);
    return this.http
      .get<ResponseArrayDTO<PointConfigDTO[]>>(
        environment.httpUrl + '/v1/api/' + 'point/history-point-user',
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Point
  getPoint(
    page: number,
    limit: number,
    search: string,
    sortBy: string
  ): Observable<ResponseArrayDTO<PointDTO[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('search', search)
      .set('sortBy', sortBy);
    return this.http
      .get<ResponseArrayDTO<PointDTO[]>>(
        environment.httpUrl + '/v1/api/' + 'point',
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  getPointByPersonalNumber(
    personalNumber: string
  ): Observable<ResponseObjectDTO<PointDTO>> {
    return this.http
      .get<ResponseObjectDTO<PointDTO>>(
        environment.httpUrl + '/v1/api/' + 'point/' + personalNumber
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  createPoint(dto: PointCreateDTO): Observable<ResponseObjectDTO<PointDTO>> {
    return this.http
      .post<ResponseObjectDTO<PointDTO>>(
        environment.httpUrl + '/v1/api/' + 'point',
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  updatePoint(
    uuid: string,
    dto: PointCreateDTO
  ): Observable<ResponseObjectDTO<PointDTO>> {
    return this.http
      .put<ResponseObjectDTO<PointDTO>>(
        environment.httpUrl + '/v1/api/' + 'point/' + uuid,
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  deletePoint(uuid: string): Observable<ResponseObjectDTO<PointDTO>> {
    return this.http
      .delete<ResponseObjectDTO<PointDTO>>(
        environment.httpUrl + '/v1/api/' + 'point/' + uuid
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  loginPoint(dto: LoginDTO): Observable<ResponseObjectDTO<PointDTO>> {
    return this.http
      .post<ResponseObjectDTO<PointDTO>>(
        environment.httpUrl + '/v1/api/' + 'point/login',
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }
}
