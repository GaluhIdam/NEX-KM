import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable, lastValueFrom } from 'rxjs';
import { Injectable } from '@angular/core';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import { PaginationDTO } from '../../dtos/pagination.dto';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { ReportServiceInterface } from '../../interfaces/homepage/report.service.interface';
import { ReportDTO } from '../../dtos/homepage/report';

@Injectable()
export class ReportService implements ReportServiceInterface {
  constructor(private readonly _httpClient: HttpClient) {}

  getReportData(
    params?: string
  ): Observable<ResponseObjectDTO<PaginationDTO<ReportDTO[]>>> {
    return this._httpClient.get<
      ResponseObjectDTO<PaginationDTO<ReportDTO[]>>
    >(`${environment.httpUrl}/v1/api/Report?${params}`);
  }

  getReportDataByUuid(
    uuid: string
  ): Observable<ResponseObjectDTO<ReportDTO>> {
    return this._httpClient.get<ResponseObjectDTO<ReportDTO>>(
      `${environment.httpUrl}/v1/api/Report/${uuid}`
    );
  }

  storeReportData(
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<ReportDTO>>> {
    return this._httpClient.post<ResponseObjectDTO<ReportDTO>>(
      `${environment.httpUrl}/v1/api/Report`,
      requestBody,
      { reportProgress: true, observe: 'events' }
    );
  }

  updateReportData(
    uuid: string,
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<ReportDTO>>> {
    return this._httpClient.put<ResponseObjectDTO<ReportDTO>>(
      `${environment.httpUrl}/v1/api/Report/${uuid}`,
      requestBody,
      { reportProgress: true, observe: 'events' }
    );
  }

  updateReportDataStatus(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<ReportDTO>> {
    return this._httpClient.put<ResponseObjectDTO<ReportDTO>>(
      `${environment.httpUrl}/v1/api/Report/status/${uuid}`,
      requestBody
    );
  }

  deleteReportData(
    requestBody: object
  ): Observable<ResponseObjectDTO<ReportDTO>> {
    return this._httpClient.delete<ResponseObjectDTO<ReportDTO>>(
      `${environment.httpUrl}/v1/api/merchandise`,
      { body: requestBody }
    );
  }
}
