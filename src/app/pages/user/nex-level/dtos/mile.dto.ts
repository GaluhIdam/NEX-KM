export interface MileDTO {
  id: number;
  uuid: string;
  level: string;
  category: string;
  name: string;
  image: string;
  path: string;
  minPoint: number;
  personalNumber: string;
  maxPoint: number;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MileCreateDTO {
  image: File;
  level: string;
  category: string;
  personalNumber: string
  name: string;
  minPoint: number;
  maxPoint: number;
  status: boolean;
}
