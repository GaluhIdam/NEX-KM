import { RolePermissionDTO } from './role-permission.dto';

export interface UserListDTO {
  id: number;
  userName: string;
  userPhoto: string;
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
  instagram: string | null;
  linkedIn: string | null;
  facebook: string | null;
  token: string | null;
  signAs: string | null;
  createdAt: Date;
  updatedAt: Date;
  skillUser: SkillUserListDTO[];
  interestUser: InterestUserListDTO[];
  followerUser: [];
  followingUser: [];
  roleUser: ListRoleDTO[];
}

export interface ListRoleDTO {
  listRole: RolePermissionDTO;
}

export interface UserListUpdateDTO {
  userName: string;
  userPhoto: File;
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
  instagram: string | null;
  linkedIn: string | null;
  facebook: string | null;
}

export interface interestUserDTO {
  id: number;
  uuid: string;
  personalNumber: string;
  interestId: number;
  createdAt: Date;
  updatedAt: Date;
  interestList: InterestDTO;
}

export interface skillUserDTO {
  id: number;
  uuid: string;
  personalNumber: string;
  skillId: number;
  createdAt: Date;
  updatedAt: Date;
  skillList: SkillDTO;
}

export interface InterestDTO {
  id: number;
  uuid: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SkillDTO {
  id: number;
  uuid: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSkillDTO {
  name: string;
  personalNumber: string;
  skillId: number;
}

export interface UserInterestDTO {
  name: string;
  personalNumber: string;
  interestId: number;
}

export interface AuthDTO {
  personalNumber: string;
  personalEmail: string;
}

export interface SkillUserListDTO {
  id: number;
  uuid: string;
  personalNumber: string;
  skillId: number;
  createdAt: string;
  updatedAt: string;
  skillList: SkillDTO;
}

export interface InterestUserListDTO {
  id: number;
  uuid: string;
  personalNumber: string;
  interestId: number;
  createdAt: string;
  updatedAt: string;
  interestList: InterestDTO;
}

export interface UserFollowInfo {
  id: number;
  uuid: string;
  personalNumberFollower: string;
  personalNumberFollowing: string;
  createdAt: string;
  updatedAt: string;
}

export interface signAsDTO {
  signAs: string | null;
}

export const defaultUserListDTO: UserListDTO = {
  id: 0,
  userName: '',
  userPhoto: '',
  personalNumber: '',
  personalName: '',
  personalTitle: null,
  personalUnit: '',
  personalBirthPlace: null,
  personalBirthDate: null,
  personalGrade: null,
  personalJobDesc: null,
  personalEmail: null,
  personalImage: null,
  instagram: null,
  linkedIn: null,
  facebook: null,
  token: null,
  signAs: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  skillUser: [],
  interestUser: [],
  followerUser: [],
  followingUser: [],
  roleUser: [],
};
