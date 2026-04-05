export interface IUser {
  id: number;
  name: string;
  userName: string;
  email: string;
  password?: string;
  activated: boolean;
  permissions: IPermission[];
}

interface IPermission {
  id: number;
  description: string;
}

export interface IFormCadLoginModel {
  name: string;
  userName: string;
  email: string;
  password: string;
  activated: boolean;
  permissions: IPermission[];
}

export interface IFormLoginModel {
  userName: string;
  password: string;
}
