import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment.prod';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { ForumVoteServiceInterface } from '../../interfaces/nex-talk/forum-vote.service.interface';
import { ForumVoteDTO } from '../../dtos/nex-talk/forum-vote.dto';

@Injectable()
export class ForumVoteDataService implements ForumVoteServiceInterface {
  constructor(private readonly _httpClient: HttpClient) {}

  getForumVote(forumId: number): Observable<ResponseObjectDTO<ForumVoteDTO[]>> {
    return this._httpClient.get<ResponseObjectDTO<ForumVoteDTO[]>>(
      `${environment.httpUrl}/v1/api/forum-vote/${forumId}`
    );
  }

  updateForumVote(
    requestBody: object
  ): Observable<ResponseObjectDTO<ForumVoteDTO>> {
    return this._httpClient.post<ResponseObjectDTO<ForumVoteDTO>>(
      `${environment.httpUrl}/v1/api/forum-vote/updates`,
      requestBody
    );
  }
}
