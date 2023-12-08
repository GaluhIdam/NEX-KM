import { Observable } from 'rxjs';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { PaginationDTO } from '../../dtos/pagination.dto';
import { ForumDTO } from '../../dtos/nex-talk/forum.dto';
import { StatisticDTO } from '../../dtos/nex-talk/statistic.dto';
import { ForumVoteDTO } from '../../dtos/nex-talk/forum-vote.dto';

export abstract class ForumVoteServiceInterface {
  abstract getForumVote(
    forumId: number
  ): Observable<ResponseObjectDTO<ForumVoteDTO[]>>;

  abstract updateForumVote(
    requestBody: object
  ): Observable<ResponseObjectDTO<ForumVoteDTO>>;
}
