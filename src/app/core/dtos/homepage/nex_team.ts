export interface NexTeamDTO {
  id: number;
  uuid: string;
  path: string;
  personalName: string;
  personalEmail: string;
  personalUnit: string;
  personnelNumber: string;
  position: string;
  personalNumber: string;
}

export interface NexTeamCreateDTO {
  personnelNumber : string;
  position: string;
}


export interface NexTeamUpdateDTO {
  position: string;
}
