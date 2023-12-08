export interface MerchandiseDTO {
  _count: any;
  id: number;
  uuid: string;
  personalNumber: string;
  title: string;
  description: string;
  qty: number;
  point: number;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  imageMerchandise: MerchandiseImageDataDTO[];
}

export interface MerchandiseCreateDTO {
  personalNumber: string;
  title: string;
  description: string;
  qty: number;
  point: number;
  isPinned: boolean;
}

export interface MerchandiseCreateMultipleDTO {
  merchandiseId: string;
  image: File;
}

export interface MerchandisePinDTO {
  isPinned: boolean;
}

export interface MerchandiseImageDataDTO {
  id: number;
  uuid: string;
  merchandiseId: number;
  personalNumber: string;
  image: string;
  path: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MerchandiseImageUpdateDTO {
  merchandiseId: number;
  personalNumber: string;
  file: File;
}

export interface MerchandiseImageDTO {
  personalNumber: string;
  merchandiseId: number;
  image: File;
}
