export interface LearningFuseDTO {
  id: number;
  search: string;
  count: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResultMergeLearningDTO {
  result: MergeLearningDTO[];
  total: number;
}

export interface MergeLearningDTO {
  id: number;
  uuid: string;
  title: string;
  description: string;
  path: string;
  unit: string;
  personalNumber: string;
}
