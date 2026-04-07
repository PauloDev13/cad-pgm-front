export interface IUsuarioRequest {
  name: string;
  userName: string;
  email: string;
  password?: string;
  activated: boolean;
  permissions: string[];
}

export interface IUsuarioResponse {
  id: number;
  name: string;
  userName: string;
  email: string;
  activated: boolean;
  permissions: string[];
}
