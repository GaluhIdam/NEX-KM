import { ForumCommentLikeDTO } from './forum-comment-like.dto';

export interface ForumCommentDTO {
  id: number;
  uuid: string;
  forumId: number;
  personalNumber: string;
  createdBy: string;
  isChildCommentShow: boolean;
  comment: string;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
  childComment: ForumCommentDTO[];
  likeComment: ForumCommentLikeDTO[];
}
