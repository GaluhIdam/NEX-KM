export interface FollowerFollowingDTO {
  id: number;
  uuid: string;
  personalNumberFollower: string;
  personalNumberFollowing: string;
  personalNameFollower: string;
  personalNameFollowing: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFollowerFollowingDTO {
  personalNumberFollower: string;
  personalNumberFollowing: string;
}

export interface MergeFollowDTO {
  follower: FollowerFollowingDTO;
  following: FollowerFollowingDTO;
}
