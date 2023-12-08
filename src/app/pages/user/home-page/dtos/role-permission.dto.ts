import { UserListDTO } from './user-list.dto';

export interface RolePermissionDTO {
  id: number;
  uuid: string;
  name: string;
  description: string;
  page: string;
  createdAt: Date;
  updatedAt: Date;
  permissionRole: PermissionRoleDTO[];
}

export interface PermissionRoleDTO {
  id: number;
  uuid: number;
  roleId: number;
  masterPermissionId: number;
  createdAt: Date;
  updatedAt: Date;
  permissionMaster: MasterPermissionDTO;
}

export interface MasterPermissionDTO {
  id: number;
  uuid: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RolePermissionCreateDTO {
  name: string;
  description: string;
  page: string;
  permission: masterPermissionSelectDTO[];
}

export interface masterPermissionSelectDTO {
  masterPermissionId: number;
}

export interface UserInRoleDTO {
  id: number;
  uuid: string;
  roleId: number;
  userId: number;
  listRole: RolePermissionDTO;
  roleUser: UserListDTO;
}

export interface UserInRoleCreateDTO {
  roleId: number;
  userId: number;
}
