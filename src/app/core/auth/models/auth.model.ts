export interface IAuthRequest {
  login: string;
  password?: string;
}

export interface IAuthResponse {
  userName: string;
  roles: string[];
}
