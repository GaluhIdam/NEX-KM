import { Observable } from 'rxjs';
import { ResponseObjectDTO } from '../../dtos/response.dto';
import { PaginationDTO } from '../../dtos/pagination.dto';
import { ForumCommentDTO } from '../../dtos/nex-talk/forum-comment.dto';

export abstract class ForumCommentServiceInterface {
  abstract getForumCommentData(
    params?: string
  ): Observable<ResponseObjectDTO<PaginationDTO<ForumCommentDTO[]>>>;

  abstract getForumCommentDetailDataByUuid(
    uuid: string
  ): Observable<ResponseObjectDTO<ForumCommentDTO>>;

  abstract storeForumCommentData(
    requestBody: object
  ): Observable<ResponseObjectDTO<ForumCommentDTO>>;

  abstract updateForumCommentData(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<ForumCommentDTO>>;

  abstract deleteForumCommentData(
    uuid: string
  ): Observable<ResponseObjectDTO<ForumCommentDTO>>;

  abstract updateForumCommentChildShow(
    uuid: string,
    requestBody: object
  ): Observable<ResponseObjectDTO<ForumCommentDTO>>;
}
