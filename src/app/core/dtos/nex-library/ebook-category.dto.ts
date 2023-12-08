import { EBookDTO } from './ebook.dto';

export interface EBookCategoryDTO {
  id: number;
  uuid: string;
  name: string;
  personalNumber: string;
  isActive: boolean;
  ebookCategoriesEbooks: EBookDTO[];
  createdAt: string;
  updatedAt: string;
}
