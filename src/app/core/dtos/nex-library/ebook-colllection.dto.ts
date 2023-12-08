import { EBookCategoryDTO } from './ebook-category.dto';
import { EBookReviewDTO } from './ebook-review.dto';
import { EBookDTO } from './ebook.dto';

export interface EBookCollectionDTO {
  data: boolean;
  id: number;
  uuid: string;
  ebookId: number;
  personalNumber: string;
  createdAt: string;
  updatedAt: string;
  collectionEbook: EBookDTO;
}
