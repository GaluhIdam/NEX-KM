import { Observable } from 'rxjs';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { UnitDinasDTO } from '../../dtos/nex-library/unit-dinas.dto';

export abstract class UnitDinasServiceInterface {
  abstract getUnitDinasData(
    params?: string
  ): Observable<ResponseObjectDTO<UnitDinasDTO[]>>;

  abstract getAllUnitDinasData(): Observable<ResponseObjectDTO<UnitDinasDTO[]>>;
}
