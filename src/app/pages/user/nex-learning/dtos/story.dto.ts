export interface StoryDTO {
  id: number;
  uuid: string;
  category: string;
  title: string;
  description: string;
  personalNumber: string;
  uploadBy: string;
  unit: string;
  score: number;
  approvalStatus: boolean | null;
  approvalDesc: string | null;
  approvalBy: string | null;
  bannedStatus: boolean;
  editorChoice: boolean;
  favorite: boolean;
  video: string;
  path: string;
  cover: string;
  createdAt: Date;
  updatedAt: Date;
  view: number;
  _count?: {
    watchStory?: number;
  };
}

export interface StoryPublishDTO {
  category: string;
  title: string;
  description: string;
  personalNumber: string;
  unit: string;
  fileVideo: File;
  cover: File;
  uploadBy: string;
  status: boolean;
}

export interface StoryStatusDTO {
  approvalStatus: boolean;
  approvalDesc: string | null;
  approvalBy: string;
}

export interface StoryBannedDTO {
  status: boolean;
  descStatus: string | null;
}

export interface WatchStoryDTO {
  personalNumber: string;
  storyId: number;
}
