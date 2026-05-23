/*==================================
            INTERFACES
====================================*/

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

/*==================================
            TYPES
==================================== */

export type TUsuarioUpdate = Omit<IUsuarioRequest, 'confirmPassword' | 'password'>;

export type TUsuarioUpdatePut = Omit<IUsuarioRequest, 'password'>;

export type TRegisterNewUser = Omit<
  IUsuarioRequest,
  'activated' | 'permissions' | 'forcePasswordChange'
>;

/*==================================
            CONSTANTS
==================================== */

export const roles: IRoles = {
  roles: ['admin', 'rh', 'gabinete', 'guest']
};
