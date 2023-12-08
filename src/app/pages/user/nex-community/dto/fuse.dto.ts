export interface CommunityFuseDTO {
  id: number;
  search: string;
  count: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResultMergeCommunityDTO {
  result: MergeCommunityDTO[];
  total: number;
}

export interface MergeCommunityDTO {
  id: number;
  uuid: string;
  title: string;
  description: string;
  path: string;
  personalNumber: string;
}
