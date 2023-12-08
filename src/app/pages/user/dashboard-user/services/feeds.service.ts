import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment.prod";
import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { ResponseFeedsDTO } from "src/app/core/dtos/response.dto";
import { BaseController } from "src/app/core/BaseController/base-controller";
import { QueryParams } from "../dtos/feed.dto";

@Injectable({ providedIn: 'root' })
export class FeedsService extends BaseController {
    private baseUrl = `${environment.apiUrl}/v1/api/feeds`

    constructor(private http: HttpClient) {
        super(FeedsService.name)
    }

    getAllFeeds(personnelNumber: string, queryParams?: QueryParams): Observable<ResponseFeedsDTO> {
        let query;
        if (queryParams) query = `?approvalStatus=${queryParams?.approvalStatus}&approvalStatusBool=${queryParams?.approvalStatusBool}&status=${queryParams?.status}&bannedStatus=${queryParams?.bannedStatus}`

        return this.http.get<ResponseFeedsDTO>(`${this.baseUrl}/${personnelNumber}${query ?? ''}`)
            .pipe(map(response => response))
    }
}
