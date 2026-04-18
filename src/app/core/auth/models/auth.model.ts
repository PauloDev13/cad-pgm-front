export interface IAuthRequest {
  userName: string;
  password?: string;
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

// O que vem do Backend no momento do login
export interface IAuthResponse {
  token: string; // O famoso JWT
}

// O que nós vamos ler "escondido" dentro do Token (Payload do JWT)
export interface IDecodedToken {
  sub: string; // É aqui que o backend costuma guardar o userName/login
  roles: string[]; // As permissões ("ROLE_ADMIN", "ROLE_USER")
  isForcePasswordChange: boolean; // Indica se é obrigatório trocar a senha
  exp: number; // Data de expiração
}

// Só interessa o Claim username dentro do Token (Payload do JWT)
export interface IDecodedTokenUsername {
  username: string;
}

// O estado do usuário que ficará disponível no Signal para o nosso Frontend inteiro
export interface ILoggedUser {
  userName: string;
  roles: string[];
  token: string;
  isForcePasswordChange: boolean;
}

export interface IRegisterUserRequest {
  name: string;
  userName: string;
  email: string;
  password: string;
}

export interface IRegisterUserResponse {
  id: number;
  name: string;
  userName: string;
  email: string;
  password: string;
}
