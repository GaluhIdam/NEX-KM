import { PodcastCollaboratorDTO } from './podcast-collaborator.dto';
import { SerieDTO } from './serie.dto';

export interface PodcastDTO {
  id: number;
  uuid: string;
  personalNumber: string;
  serieId: number;
  title: string;
  description: string;
  image: string;
  pathImage: string;
  file: string;
  pathFile: string;
  approvalStatus: string;
  approvalMessage: string;
  editorChoice: boolean;
  approvalBy: string;
  status: boolean;
  likeCount: number;
  duration: string;
  isPause: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  seriePodcast: SerieDTO;
  colaboratorPodcast: PodcastCollaboratorDTO[];
}
