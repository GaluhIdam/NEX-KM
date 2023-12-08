export interface CommunityDTO {
  id: number;
  uuid: string;
  name: string;
  personalNumber: string;
  location: string;
  about: string;
  leader: string;
  leaderPersonalNumber: string;
  leaderProfile: string;
  instagram: string;
  statusPublish: boolean;
  bannedStatus: boolean;
  thumbnailPhoto: string;
  thumbnailPhotoPath: string;
  headlinedPhoto: string;
  headlinedPhotoPath: string;
  icon: string;
  founded: Date;
  createdAt: Date | null;
  updatedAt: Date | null;
  _count: Count;
}

export interface Count {
  communitiesCommunityActivities: number;
  communitiesCommunityFollows: number;
  communitiesCommunityMembers: number;
}

export interface CommunityPublishDTO {
  name: string;
  personalNumber: string;
  location: string;
  about: string;
  leader: string;
  leaderProfile: string;
  leaderPersonalNumber: string;
  instagram: string;
  thumbnailPhotoFile: File;
  headlinePhotoFile: File;
  iconFile: File;
  leaderUnit: string;
  leaderEmail: string;
  founded: Date;
}

export interface CommunityPublishPrivateDTO {
  status: boolean;
}

export interface CommunityMemberDTO {
  id: number;
  uuid: string;
  communityId: number;
  communityRoleId: number;
  personalNumber: string;
  personalName: string;
  personalUnit: string;
  personalEmail: string;
  createdAt: Date;
  updatedAt: Date;
  communityMembersCommunityRoles: RoleCommunityDTO;
}

export interface CommunityMemberCreateDTO {
  communityId: number;
  communityRoleId: number;
  personalNumber: string;
  personalName: string;
  personalUnit: string;
  personalEmail: string;
}

export interface RoleCommunityDTO {
  id: number;
  uuid: string;
  name: string;
}

export interface CreateRoleCommunityDTO {
  name: string;
}

export interface RecentActivityDTO {
  id: number;
  uuid: string;
  communityId: number;
  title: string;
  description: string;
  photo: string;
  path: string;
  personalNumber: string;
  personalName: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  communityActivitiesCommunities: CommunityDTO;
}

export interface RecentActivityCreateDTO {
  communityId: number;
  title: string;
  description: string;
  personalNumber: string;
  personalName: string;
  photo: File;
}

export interface CreateFollowDTO {
  communityId: number;
  personalNumber: string;
}

export interface GetFollowDTO {
  uuid: string;
  communityId: number;
  personalNumber: string;
}

export interface CommentActivityDTO {
  id: number;
  uuid: string;
  communityActivityId: number;
  personalNumber: string;
  personalName: string;
  personalNumberMention: string | null;
  personalNameMention: string | null;
  comment: string;
  parentId: number | null;
  like: number;
  dislike: number;
  commentLikeActivity: CommentActivityLikeDTO[];
  _count: {
    childComment: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCommentActivityDTO {
  activityId: number;
  personalNumber: string;
  personalName: string;
  comment: string;
  parentId: number | null;
  personalNumberMention: string | null;
  personalNameMention: string | null;
}

export interface CommunityLikeDTO {
  id: number;
  uuid: string;
  activityId: number;
  commentActivityId: number;
  likeOrdislike: boolean;
  personalNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCommunityLikeDTO {
  activityId: number;
  commentActivityId: number;
  likeOrdislike: boolean;
  personalNumber: string;
}

export interface CreateCommunityLikeDTO {
  activityId: number;
  commentActivityId: number;
  likeOrdislike: boolean;
  personalNumber: string;
}

export interface CommentActivityLikeDTO {
  id: number;
  uuid: string;
  activityId: number;
  commentActivityId: number;
  likeOrdislike: boolean;
  personalNumber: string;
}

export interface CommunityUserDTO {
  id: number;
  uuid: string;
  communityId: number;
  communityRoleId: number;
  personalNumber: string;
  personalName: string;
  personalUnit: string;
  personalEmail: string;
  createdAt: Date;
  updatedAt: Date;
  communityMembersCommunities: CommunityDTO;
}
