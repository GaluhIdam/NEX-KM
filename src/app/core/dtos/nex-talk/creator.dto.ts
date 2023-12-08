import { SerieDTO } from './serie.dto';
import { TalkCategoryDTO } from './talk-category.dto';

export interface CreatorDTO {
  id: number;
  uuid: string;
  talkCategoryId: number;
  personalNumber: string;
  name: string;
  description: string;
  image: string;
  path: string;
  likeCount: string;
  approvalStatus: string;
  approvalMessage: string;
  approvalBy: string;
  status: boolean;
  editorChoice: boolean;
  createdBy: string;
  unit: string;
  createdAt: string;
  updatedAt: string;
  talkCategory: TalkCategoryDTO;
  series: SerieDTO[];
}
