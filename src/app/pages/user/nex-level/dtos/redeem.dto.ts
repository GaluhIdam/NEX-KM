import { MerchandiseDTO } from "./merchandise.dto";
export interface RedeemDTO {
  id: number;
  uuid: string;
  merchandiseId: number;
  personalNumber: string;
  personalName: string;
  personalUnit: string;
  personalEmail: string;
  redeemDate: Date | null;
  status: boolean | null;
  count: number;
  createdAt: Date;
  updatedAt: Date;
  merchandiseRedeem: MerchandiseDTO;
}

export interface RedeemCreateDTO {
  merchandiseId: number;
  personalNumber: string;
  personalName: string;
  personalUnit: string;
  personalEmail: string;
}

export interface RedeemStatusDTO {
  status: boolean;
  descStatus: string | null;
  approvalBy: string;
}

export interface RedeemUpdateDTO {
  merchandiseId: number;
  personalNumber: string;
  personalName: string;
  personalUnit: string;
  personalEmail: string;
  redeemDate: string;
  status: boolean;
}
