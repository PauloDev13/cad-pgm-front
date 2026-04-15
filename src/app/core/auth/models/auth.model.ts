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

export interface ResetPasswordDialogData {
  title: string;
  message: string;
  password: string;
}

// 1. O que vem do Backend no momento do login
export interface IAuthResponse {
  token: string; // O famoso JWT
  forcePasswordChange: boolean; // Presumi que o backend ainda devolve isso aqui
}

// 2. O que nós vamos ler "escondido" dentro do Token (Payload do JWT)
export interface IDecodedToken {
  sub: string; // É aqui que o backend costuma guardar o userName/login
  roles: string[]; // As permissões ("ROLE_ADMIN", "ROLE_USER")
  exp: number; // Data de expiração
}

// 3. O estado do usuário que ficará disponível no Signal para o nosso Frontend inteiro
export interface ILoggedUser {
  userName: string;
  roles: string[];
  token: string;
  forcePasswordChange: boolean;
}
