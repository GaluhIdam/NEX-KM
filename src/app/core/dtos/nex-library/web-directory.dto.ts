import { UnitDinasDTO } from './unit-dinas.dto';

export interface WebDirectoryDTO {
  id: number;
  uuid: string;
  dinasId: number;
  title: string;
  description: string;
  link: string;
  cover: string;
  path: string;
  personalNumber: string;
  status: boolean;
  approvalStatus: string;
  createdAt: string;
  updatedAt: string;
  directoryWeb: UnitDinasDTO;
}
