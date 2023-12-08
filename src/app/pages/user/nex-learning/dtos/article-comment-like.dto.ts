export interface ArticleCommentLikeDTO {
  id: number;
  uuid: string;
  articleId: number;
  commentArticleId: number;
  likeOrdislike: boolean;
  personalNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ArticleCommentLikePostDTO {
  articleId: number;
  commentArticleId: number;
  likeOrdislike: boolean;
  personalNumber: string;
}
