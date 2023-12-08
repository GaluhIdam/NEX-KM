import { EBookCategoryDTO } from './ebook-category.dto';
import { EBookReviewDTO } from './ebook-review.dto';

export interface EBookDTO {
  id: number;
  ebookCategoryId: number;
  uuid: string;
  ebookFile: string;
  title: string;
  ebookCover: string;
  pathCover: string;
  pathEbook: string;
  synopsis: string;
  overview: string;
  author: string;
  aboutAuthor: string;
  personalNumber: string;
  uploadBy: string;
  unit: string;
  viewCount: number;
  approvalStatus: string;
  descStatus: string;
  approvalBy: string;
  editorChoice: boolean;
  status: boolean;
  totalRate: number;
  createdAt: string;
  updatedAt: string;
  ebooksEbookCategories: EBookCategoryDTO;
  ebooksEbookReviews: EBookReviewDTO[];
}
