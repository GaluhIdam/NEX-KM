import { AlbumCategoryDTO } from './album-category.dto';
import { AlbumGalleryDTO } from './album-gallery.dto';

export interface AlbumDTO {
  id: number;
  uuid: string;
  categoryAlbumId: number;
  albumCover: string;
  path: string;
  title: string;
  description: string;
  personalNumber: string;
  uploadBy: string;
  unit: string;
  approvalStatus: string;
  descStatus: string;
  approvalBy: string;
  editorChoice: boolean;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  albumCategory: AlbumCategoryDTO;
  galleryAlbum: AlbumGalleryDTO[];
}
