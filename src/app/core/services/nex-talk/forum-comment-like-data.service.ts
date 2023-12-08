import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment.prod';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { ForumVoteServiceInterface } from '../../interfaces/nex-talk/forum-vote.service.interface';
import { ForumVoteDTO } from '../../dtos/nex-talk/forum-vote.dto';
import { ForumCommentLikeDTO } from '../../dtos/nex-talk/forum-comment-like.dto';
import { ForumCommentLikeServiceInterface } from '../../interfaces/nex-talk/forum-comment-like.service.interface';

@Injectable()
export class ForumCommentLikeDataService
  implements ForumCommentLikeServiceInterface
{
  constructor(private readonly _httpClient: HttpClient) {}

  getForumCommentLike(
    forumCommentId: number
  ): Observable<ResponseObjectDTO<ForumCommentLikeDTO[]>> {
    return this._httpClient.get<ResponseObjectDTO<ForumCommentLikeDTO[]>>(
      `${environment.httpUrl}/v1/api/forum-comment/like/${forumCommentId}`
    );
  }

  updateForumCommentLike(
    requestBody: object
  ): Observable<ResponseObjectDTO<ForumCommentLikeDTO>> {
    return this._httpClient.post<ResponseObjectDTO<ForumCommentLikeDTO>>(
      `${environment.httpUrl}/v1/api/forum-comment/like/updates`,
      requestBody
    );
  }
}
