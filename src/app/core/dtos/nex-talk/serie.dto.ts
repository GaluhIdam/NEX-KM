import { CreatorDTO } from './creator.dto';
import { PodcastDTO } from './podcast.dto';

export interface SerieDTO {
  id: number;
  uuid: string;
  serieCategoryId: number;
  creatorId: number;
  personalNumber: string;
  image: string;
  path: string;
  title: string;
  description: string;
  approvalStatus: string;
  approvalMessage: string;
  approvalBy: string;
  editorChoice: boolean;
  status: boolean;
  isPause: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator: CreatorDTO;
  seriesPodcast: PodcastDTO[];
}
