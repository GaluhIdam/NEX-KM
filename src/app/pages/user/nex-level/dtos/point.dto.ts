import { MileDTO } from './mile.dto';

export interface PointDTO {
  id: number;
  uuid: string;
  personalNumber: string;
  personalName: string;
  personalUnit: string;
  title: string;
  personalEmail: string;
  point: number;
  totalPoint: number;
  levelPoint?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PointCreateDTO {
  personalNumber: string;
  personalName: string;
  personalUnit: string;
  title: string;
  personalEmail: string;
  point: number;
  totalPoint: number;
}

export interface LoginDTO {
  personalNumber: string;
}
