export interface SharingDTO {
  id: number;
  uuid: string;
  personalNumber: string;
  personalName: string;
  personalEmail: string;
  personalUnit: string;
  title: string;
  place: string;
  country: string;
  state: string;
  city: string;
  date: string;
  description: string;
  approvalStatus: boolean;
  approvedBy: number;
  path: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SharingCreateDTO {
  title: string;
  place: string;
  description: string;
  date: string;
  country: string;
  state: string;
  city: string;
  personalNumber: string;
}

export interface SharingExpStatusDTO {
  approvalStatus: boolean;
  approvedBy: string;
}
