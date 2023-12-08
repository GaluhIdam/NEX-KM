export interface SoeDetailDTO {
  body: SoeDTO;
  httpStatus: string;
  headers: null;
}
export interface SoeBodyAllDTO {
  body: SoeAllDTO;
  httpStatus: string;
  headers: null;
}
export interface SoeDTO {
  personalNumber: string;
  personalName: string;
  personalTitle: string;
  personalUnit: string;
  personalBirthPlace: string;
  personalBirthDate: string;
  personalGrade: string;
  personalJobDesc: string;
  personalEmail: string;
  personalImage: string;
}

export interface SoeAllDTO {
  data: SoeDTO[];
  currentPage: number;
  totalItems: number;
  lastPage: number;
  totalItemsPerPage: number;
}
