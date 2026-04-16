import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  IAuthRequest,
  IAuthResponse,
  IDecodedToken,
  IForgotPasswordRequest,
  ILoggedUser,
  IRegisterUserRequest,
  IRegisterUserResponse,
  IResetPasswordRequest,
} from '../models/auth.model';
import { isPlatformBrowser } from '@angular/common';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly TOKEN_KEY = 'jwt-token';
  private readonly API_URL = `${environment.apiUrl}/api/v1`;
  private readonly plataformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);

  // A chave que usaremos para guardar o usuário logado no localstorage
  currentUser = signal<ILoggedUser | null>(null);

  constructor() {
    this.currentUser.set(this.getStoredLoggedUser());
  }

  // Méthod de Login simulando uma requisição HTTP
  login(payload: IAuthRequest): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(`${this.API_URL}/auth/login`, payload).pipe(
      tap((response: IAuthResponse) => {
        // Decodifica o token retornado da API
        const decoded = jwtDecode<IDecodedToken>(response.token);

        // Monta um usuário com os dados do token decodificado
        const loggedUser: ILoggedUser = {
          userName: decoded.sub,
          roles: decoded.roles || [],
          token: response.token,
          isForcePasswordChange: decoded.isForcePasswordChange,
        };

        // Atualiza o Signal para o restante do app reagir
        this.currentUser.set(loggedUser);

        // Persiste no Storage para manter a sessão ao dar F5
        if (isPlatformBrowser(this.plataformId)) {
          localStorage.setItem(this.TOKEN_KEY, response.token);
        }
      }),
      catchError((error) => {
        console.error('Erro na autenticação:', error);
        const msg = error.error?.message || 'Credenciais inválidas';
        return throwError(() => new Error(msg));
      }),
    );
  }

  // Limpa o estado global ao sair do sistema
  logout() {
    // Atribui null ao usuário logado
    this.currentUser.set(null);

    if (isPlatformBrowser(this.plataformId)) {
      // Remove o usuário logado do localstorage
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  registerNewUserPublic(newUser: IRegisterUserRequest): Observable<IRegisterUserResponse> {
    const url = `${this.API_URL}/auth/register`;
    return this.http.post<IRegisterUserResponse>(url, newUser).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Erro no cadastro', error);
        const msg = error.error.message || error.error || 'Erro ao realizar cadastro';
        return throwError(() => new Error(msg));
      }),
    );
  }

  // Solicita o envio do e-mail de recuperação
  forgotPassword(email: string): Observable<any> {
    const url = `${environment.apiUrl}/api/v1/auth/forgot-password`;
    const payload: IForgotPasswordRequest = { email };

    // Como o retorno provavelmente é apenas um 200 OK genérico, tipamos como 'any' ou 'void'
    return this.http.post(url, payload, { responseType: 'text' }).pipe(
      catchError((error) => {
        console.error('Erro ao solicitar redefinição:', error);
        return throwError(() => new Error('Falha ao processar a solicitação.'));
      }),
    );
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    const url = `${environment.apiUrl}/api/v1/auth/reset-password`;
    const payload: IResetPasswordRequest = { token, newPassword };

    return this.http.post(url, payload, { responseType: 'text' }).pipe(
      catchError((error) => {
        console.error('Erro ao redefinir senha:', error);
        // Pode ser token expirado ou inválido
        return throwError(() => new Error('O link é inválido ou expirou. Solicite novamente.'));
      }),
    );
  }

  resetPasswordByAdmin(userId: number | undefined): Observable<{ temporaryPassword: string }> {
    return this.http.post<{ temporaryPassword: string }>(
      `${environment.apiUrl}/api/v1/usuarios/${userId}/reset-password`,
      {},
    );
  }

  forcePasswordChange(userName: string, newPassword: string): Observable<void> {
    const payload = { userName, newPassword };

    return this.http.post<void>(`${environment.apiUrl}/api/v1/auth/force-password-change`, payload);
  }

  // MÉTHOD PARA BUSCAR O USUÁRIO LOGADO NO LOCALSTORAGE
  getStoredLoggedUser(): ILoggedUser | null {
    if (isPlatformBrowser(this.plataformId)) {
      const token = localStorage.getItem(this.TOKEN_KEY);
      if (token) {
        try {
          // Lê a mente do token toda vez que damos F5!
          const decoded = jwtDecode<IDecodedToken>(token);

          return {
            userName: decoded.sub,
            roles: decoded.roles || [],
            token: token,
            isForcePasswordChange: decoded.isForcePasswordChange,
          };
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  }
}
