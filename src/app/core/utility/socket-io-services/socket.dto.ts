export interface ResponseSocketDTO {
  message: string;
  uniqueId: string;
  data: Data;
}

export interface Data {
  senderPersonalNumber: string;
  receiverPersonalNumber: string;
  title: string;
  description: string;
}
