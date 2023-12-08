export interface UserListDTO {
  id: number;
  uuid: string;
  path: string;
  name: string;
  unit: string;
  title: string;
  email: string;
  interest: string;
  skill: string;
  community: string;
  post: number;
  following: number;
  followers: number;
  personalNumber: string;
}

export interface UserDataDTO {
  id: number;
  uuid: string;
  personalNumber: string;
  personalName: string;
  personalTitle: string | null;
  personalUnit: string;
  personalBirthPlace: string | null;
  personalBirthDate: string | null;
  personalGrade: string | null;
  personalJobDesc: string | null;
  personalEmail: string | null;
  personalImage: string | null;
  createdAt: Date;
  updatedAt: Date;
}
