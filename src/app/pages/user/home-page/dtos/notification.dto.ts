export interface NotificationDTO {
  id: number;
  uuid: string;
  senderPersonalNumber: string;
  receiverPersonalNumber: string;
  title: string;
  description: string;
  isRead: boolean;
  contentType: string;
  contentUuid: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationRequestDTO {
  senderPersonalNumber: string;
  receiverPersonalNumber: string;
  title: string;
  description: string;
  isRead: string;
  contentType: string;
  contentUuid: string;
}

export interface NotificationReadRequestDTO {
  isRead: boolean;
}
