export interface LoginResponse {
  login: string;
  roles: string[];
}

export interface LoginRequest {
  login: string;
  password: string;
}

export interface UsuarioResponse {
  id: number;
  name: string;
  userName: string;
  email: string;
  activated: boolean;
  permissions: string[];
  forcePasswordChange: boolean;
}
