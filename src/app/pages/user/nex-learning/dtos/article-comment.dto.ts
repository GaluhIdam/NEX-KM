import { ArticleCommentLikeDTO } from './article-comment-like.dto';

export interface ArticleCommentDTO {
  id: number;
  uuid: string;
  articleId: number;
  personalNumber: string;
  personalName: string;
  personalNumberMention: string | null;
  personalNameMention: string | null;
  comment: string;
  parentId: number | null;
  like: number;
  dislike: number;
  createdAt: Date;
  updatedAt: Date;
  commentLikeArticle: ArticleCommentLikeDTO[];
  _count: CountCommentDTO;
}

export interface CountCommentDTO {
  childComment: number;
}

export interface ArticleCommentPostDTO {
  articleId: number;
  personalNumber: string;
  personalName: string;
  personalNumberMention: string | null;
  personalNameMention: string | null;
  comment: string;
  parentId: number | null;
  like: number;
}
