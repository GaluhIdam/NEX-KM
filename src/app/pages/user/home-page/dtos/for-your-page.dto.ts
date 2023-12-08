export interface ForYourPageDTO {
  id: number;
  idContent: number;
  uuid: string;
  title: string;
  description: string;
  personalNumber: string;
  personalName: string;
  path: string;
  cover: string | null;
  link: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}
