import { AlbumDTO } from './album.dto';

export interface AlbumCategoryDTO {
  id: number;
  uuid: string;
  personalNumber: string;
  name: string;
  isActive: boolean;
  albumCategory: AlbumDTO[];
  createdAt: string;
  updatedAt: string;
}
