import { Observable } from 'rxjs';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { ForumCommentLikeDTO } from '../../dtos/nex-talk/forum-comment-like.dto';

export abstract class ForumCommentLikeServiceInterface {
  abstract getForumCommentLike(
    forumCommentId: number
  ): Observable<ResponseObjectDTO<ForumCommentLikeDTO[]>>;

  abstract updateForumCommentLike(
    requestBody: object
  ): Observable<ResponseObjectDTO<ForumCommentLikeDTO>>;
}
