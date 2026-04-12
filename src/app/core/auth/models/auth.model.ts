export interface IAuthRequest {
  login: string;
  password?: string;
}

export interface IAuthResponse {
  userName: string;
  roles: string[];
  forcePasswordChange: boolean;
}

export interface IForgotPasswordRequest {
  email: string;
}

export interface IResetPasswordRequest {
  token: string;
  newPassword: string;
}
