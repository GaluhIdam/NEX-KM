export interface PointConfigDTO {
  id: number;
  uuid: string;
  personalNumber: string;
  activity: string;
  slug: string;
  point: number;
  year: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PointConfigCreateDTO {
  activity: string;
  slug: string;
  point: number;
  status: boolean;
}
