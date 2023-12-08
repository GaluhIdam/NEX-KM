export interface ForumCommentLikeDTO {
  id: number;
  uuid: string;
  forumId: number;
  commentForumId: number;
  personalNumber: string;
  likeOrdislike: boolean;
  createdAt: string;
  updatedAt: string;
}
