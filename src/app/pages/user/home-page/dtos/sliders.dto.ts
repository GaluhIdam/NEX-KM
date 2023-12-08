export interface SliderDTO {
  path: string;
  id: number;
  uuid: string;
  personalNumber: number;
  title: string;
  description: string;
  backgroundImage: string;
  sequence: number;
  uploadedBy: string;
  status: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SliderCreateDTO {
  personalNumber: string;
  title: string;
  description: string;
  image: File;
  sequence: number;
  uploadedBy: string;
  status: boolean | null;
}
