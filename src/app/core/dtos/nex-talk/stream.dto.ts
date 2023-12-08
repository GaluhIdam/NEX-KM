import { TalkCategoryDTO } from './talk-category.dto';
import { WatchStreamDTO } from './watch-stream.dto';

export interface StreamDTO {
  id: number;
  uuid: string;
  talkCategoryId: number;
  personalNumber: string;
  title: string;
  description: string;
  thumbnail: string;
  pathThumbnail: string;
  video: string;
  pathVideo: string;
  viewCount: number;
  likeCount: number;
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
  streamWatch: WatchStreamDTO[];
}
