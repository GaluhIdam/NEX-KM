import { Observable } from 'rxjs';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { HttpEvent } from '@angular/common/http';
import { PaginationDTO } from '../../dtos/pagination.dto';
import { ReportDTO } from '../../dtos/homepage/report';

export abstract class ReportServiceInterface {
  abstract getReportData(
    params?: string
  ): Observable<ResponseObjectDTO<PaginationDTO<ReportDTO[]>>>;

  abstract getReportDataByUuid(
    uuid: string
  ): Observable<ResponseObjectDTO<ReportDTO>>;

  abstract storeReportData(
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<ReportDTO>>>;

  abstract updateReportData(
    uuid: string,
    requestBody: object
  ): Observable<HttpEvent<ResponseObjectDTO<ReportDTO>>>;

  abstract updateReportDataStatus(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<ReportDTO>>;

  abstract deleteReportData(
    requestBody: object
  ): Observable<ResponseObjectDTO<ReportDTO>>;
}
