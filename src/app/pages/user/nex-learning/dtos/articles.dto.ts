export interface ArticlesDTO<ArticleCategoryDTO> {
  id: number;
  uuid: string;
  articleCategory: ArticleCategoryDTO | null;
  personalNumber: string | null;
  title: string | null;
  content: string | null;
  image: string | null;
  path: string | null;
  score: number | null;
  uploadBy: string | null;
  unit: string | null;
  approvalStatus: boolean | null;
  approvalDesc: string | null;
  approvalBy: string | null;
  editorChoice: boolean | null;
  bannedStatus: boolean | null;
  updatedAt: Date | string | null;
  _count: CountDTO;
}

export interface CountDTO {
  articleComment: number;
}

export interface ArticlePublishDTO {
  image: File;
  personalNumber: string;
  articleCategoryId: number;
  title: string;
  content: string;
  uploadBy: string;
  unit: string;
}

export interface ArticleStatusDTO {
  status: boolean;
  descStatus: string | null;
  approvalBy: string;
  approvalByPersonalNumber: string;
}

export interface ArticleBannedDTO {
  status: boolean;
  descStatus: string | null;
}


export interface StatisticArticleDTO {
  allTime: number;
  thisMonth: number;
  published: number;
  needApproval: number;
  percent: number;
}
