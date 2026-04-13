export interface IUsuarioRequest {
  name: string;
  userName: string;
  email: string;
  password: string;
  confirmPassword?: string;
  activated: boolean;
  permissions: string[];
  forcePasswordChange?: boolean;
}

export type TUsuarioUpdate = Omit<IUsuarioRequest, 'confirmPassword' | 'password'>;

export interface IUsuarioResponse {
  id: number;
  name: string;
  userName: string;
  email: string;
  activated: boolean;
  permissions: string[];
  forcePasswordChange: boolean;
}

export interface IRoles {
  roles: string[];
}

export const roles: IRoles = {
  roles: ['admin', 'rh', 'gabinete', 'guest'],
};
