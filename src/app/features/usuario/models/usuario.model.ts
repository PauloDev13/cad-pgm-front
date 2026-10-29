export interface IUsuarioRequest {
  servidorId?: number | null;
  name: string;
  userName: string;
  email: string;
  password: string;
  confirmPassword?: string;
  activated: boolean;
  permissions: string[];
  forcePasswordChange: boolean;
}

export interface IUsuarioResponse {
  id: number;
  name: string;
  userName: string;
  email: string;
  activated: boolean;
  permissions: string[];
  forcePasswordChange: boolean;
  servidorId?: number | null;
  matriculaServidor?: string;
  cargoServidor?: string;
  servidorExcluded?: boolean;
}

export type TUsuarioDelete = Pick<IUsuarioResponse, 'id' | 'name'>

export interface IRoles {
  roles: string[];
}

export interface IUserQueryParams {
  page: number;
  size: number;
  name?: string;
  userName?: string;
  email?: string;
}

export type TUsuarioUpdate = {
  userName: string;
  activated: boolean;
  permissions: string[];
  forcePasswordChange: boolean;
  systemName?: string;
  systemEmail?: string;
}

export type TUsuarioUpdatePut = TUsuarioUpdate & {
  password?: string;
}

export const roles: IRoles = {
  roles: ['admin', 'rh', 'gabinete', 'almoxarifado', 'manutencao', 'tramitador', 'guest']
};
