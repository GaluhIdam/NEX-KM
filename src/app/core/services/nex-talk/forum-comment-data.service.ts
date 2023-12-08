import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import { PaginationDTO } from '../../dtos/pagination.dto';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { ForumCommentDTO } from '../../dtos/nex-talk/forum-comment.dto';
import { ForumCommentServiceInterface } from '../../interfaces/nex-talk/forum-comment.service.interface';

@Injectable()
export class ForumCommentDataService implements ForumCommentServiceInterface {
  constructor(private readonly _httpClient: HttpClient) {}

  getForumCommentData(
    params?: string
  ): Observable<ResponseObjectDTO<PaginationDTO<ForumCommentDTO[]>>> {
    return this._httpClient.get<
      ResponseObjectDTO<PaginationDTO<ForumCommentDTO[]>>
    >(`${environment.httpUrl}/v1/api/forum-comment?${params}`);
  }

  getForumCommentDetailDataByUuid(
    uuid: string
  ): Observable<ResponseObjectDTO<ForumCommentDTO>> {
    return this._httpClient.get<ResponseObjectDTO<ForumCommentDTO>>(
      `${environment.httpUrl}/v1/api/forum-comment/${uuid}`
    );
  }

  storeForumCommentData(
    requestBody: object
  ): Observable<ResponseObjectDTO<ForumCommentDTO>> {
    return this._httpClient.post<ResponseObjectDTO<ForumCommentDTO>>(
      `${environment.httpUrl}/v1/api/forum-comment`,
      requestBody
    );
  }

  updateForumCommentData(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<ForumCommentDTO>> {
    return this._httpClient.put<ResponseObjectDTO<ForumCommentDTO>>(
      `${environment.httpUrl}/v1/api/forum-comment/${uuid}`,
      requestBody
    );
  }

  deleteForumCommentData(
    uuid: string
  ): Observable<ResponseObjectDTO<ForumCommentDTO>> {
    return this._httpClient.delete<ResponseObjectDTO<ForumCommentDTO>>(
      `${environment.httpUrl}/v1/api/forum-comment/${uuid}`
    );
  }

  updateForumCommentChildShow(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<ForumCommentDTO>> {
    return this._httpClient.put<ResponseObjectDTO<ForumCommentDTO>>(
      `${environment.httpUrl}/v1/api/forum-comment/child-show/${uuid}`,
      requestBody
    );
  }
}
