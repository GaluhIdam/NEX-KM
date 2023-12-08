export interface BestPracticeDTO {
  id: number;
  uuid: string;
  personalNumber: string;
  title: string;
  content: string;
  image: string;
  path: string;
  uploadBy: string;
  unit: string;
  score: number;
  approvalStatus: boolean | null;
  approvalDesc: string | null;
  approvalBy: string | null;
  bannedStatus: boolean;
  editorChoice: boolean;
  favorite: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
  _count: CountDTO;
}

export interface CountDTO {
  bestPracticeComment: number;
}

export interface BestPracticePublishDTO {
  personalNumber: string;
  title: string;
  content: string;
  image: File;
  uploadBy: string;
  unit: string;
}

export interface BestPracticeStatusDTO {
  approvalStatus: boolean;
  approvalDesc: string | null;
  approvalBy: string;
}

export interface CommentBestPracticeDTO {
  id: number;
  uuid: string;
  practiceId: number;
  personalNumber: string;
  personalName: string;
  personalNumberMention: string | null;
  personalNameMention: string | null;
  comment: string;
  parentId: number | null;
  createdAt: Date;
  updatedAt: Date;
  like: number;
  dislike: number;
  commentLikeBestPractice: CommentLikeBestPracticeDTO[];
  _count: {
    childComment: number;
  };
}

export interface CommentBestPracticeCreateDTO {
  practiceId: number;
  personalNumber: string;
  personalName: string;
  personalNumberMention: string | null;
  personalNameMention: string | null;
  comment: string;
  parentId: number | null;
  like: number;
  dislike: number;
}

export interface CommentLikeBestPracticeCreateDTO {
  bestPracticeId: number;
  commentBestPracticeId: number;
  likeOrdislike: boolean;
  personalNumber: string;
}
export interface CommentLikeBestPracticeDTO {
  id: number;
  uuid: string;
  bestPracticeId: number;
  commentBestPracticeId: number;
  likeOrdislike: boolean;
  personalNumber: string;
  createdAt: Date;
  updatedAt: Date;
}
