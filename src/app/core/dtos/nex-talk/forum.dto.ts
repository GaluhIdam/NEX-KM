import { ForumCommentDTO } from './forum-comment.dto';
import { ForumVoteDTO } from './forum-vote.dto';
import { TalkCategoryDTO } from './talk-category.dto';

export interface ForumDTO {
  id: number;
  uuid: string;
  personalNumber: string;
  categoryForumId: number;
  name: string;
  path: string;
  title: string;
  description: string;
  likeCount: number;
  voteCount: number;
  approvalStatus: string;
  approvalMessage: string;
  approvalBy: string;
  editorChoice: boolean;
  createdBy: string;
  unit: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  talkCategory: TalkCategoryDTO;
  forumComment: ForumCommentDTO[];
  forumVote: ForumVoteDTO[];
}
