import { CreatorDTO } from './creator.dto';
import { ForumDTO } from './forum.dto';
import { StreamDTO } from './stream.dto';

export interface TalkCategoryDTO {
  id: number;
  uuid: string;
  name: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  creators: CreatorDTO[];
  streams: StreamDTO[];
  forums: ForumDTO[];
}
