import { HttpClient } from '@angular/common/http';
import { HttpService } from 'src/app/providers/http/http.service';
import { Observable, lastValueFrom } from 'rxjs';
import { Injectable } from '@angular/core';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import { UnitDinasDTO } from '../../dtos/nex-library/unit-dinas.dto';
import { UnitDinasServiceInterface } from '../../interfaces/nex-library/unit-dinas.service.interface';
import { ResponseObjectDTO } from '../../dtos/response.dto';

@Injectable()
export class UnitDinasDataService implements UnitDinasServiceInterface {
  constructor(private readonly _httpClient: HttpClient) {}

  getUnitDinasData(
    params?: string
  ): Observable<ResponseObjectDTO<UnitDinasDTO[]>> {
    return this._httpClient.get<ResponseObjectDTO<UnitDinasDTO[]>>(
      `${environment.httpUrl}/v1/api/unit-dinas?${params}`
    );
  }

  getAllUnitDinasData(): Observable<ResponseObjectDTO<UnitDinasDTO[]>> {
    return this._httpClient.get<ResponseObjectDTO<UnitDinasDTO[]>>(
      `${environment.httpUrl}/v1/api/unit-dinas/all`
    );
  }
}
