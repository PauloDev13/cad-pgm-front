import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  IAuthRequest,
  IAuthResponse,
  IDecodedToken,
  IDecodedTokenUsername,
  IForgotPasswordRequest,
  ILoggedUser,
  IRegisterUserRequest,
  IRegisterUserResponse,
  IResetPasswordRequest
} from '../models/auth.model';
import { isPlatformBrowser } from '@angular/common';
import { jwtDecode } from 'jwt-decode';
import { LoginStateService } from './login-state.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  readonly TOKEN_KEY = 'jwt-token';
  private readonly API_URL = `${environment.apiUrl}/api/v1`;
  private readonly plataformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);
  private readonly loginStateService = inject(LoginStateService);

  // A chave que usaremos para guardar o usuário logado no localstorage
  currentUser = signal<ILoggedUser | null>(null);

  constructor() {
    this.currentUser.set(this.getStoredLoggedUser());
  }

  // Méthod de Login
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
          isForcePasswordChange: decoded.isForcePasswordChange
        };

        // Atualiza o Signal para o restante do app reagir
        this.currentUser.set(loggedUser);

        // Persiste no Storage para manter a sessão ao dar F5
        if (isPlatformBrowser(this.plataformId)) {
          localStorage.setItem(this.TOKEN_KEY, response.token);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Erro na autenticação:', error.error);
        const msg = error.error?.message || 'Credenciais inválidas';
        return throwError(() => new Error(msg));
      })
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
      catchError((err: HttpErrorResponse) => {
        console.error('Erro no cadastro', err.error);
        const msg = err.error.message || err.error || 'Erro ao realizar cadastro';
        return throwError(() => new Error(msg));
      })
    );
  }

  // Solicita o envio do e-mail de recuperação
  forgotPassword(email: string): Observable<any> {
    const url = `${environment.apiUrl}/api/v1/auth/forgot-password`;
    const payload: IForgotPasswordRequest = { email };

    // Como o retorno provavelmente é apenas um 200 OK genérico, tipamos como 'any' ou 'void'
    return this.http.post(url, payload, { responseType: 'text' }).pipe(
      catchError((err: HttpErrorResponse) => {
        let msg = 'Falha ao processar a solicitação.';

        if (err.error) {
          try {
            const errorObj = JSON.parse(err.error);
            msg = errorObj.message || msg;
          } catch (e) {
            console.error('Erro ao confirmar e-mail:', err.error);
            msg = err.error.message || err.error || msg;
          }
        }
        return throwError(() => new Error(msg));
      })
    );
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    const url = `${environment.apiUrl}/api/v1/auth/reset-password`;
    const payload: IResetPasswordRequest = { token, newPassword };

    // Decodifica o token para extrair o claim username
    const decoded = jwtDecode<IDecodedTokenUsername>(token);

    return this.http.post(url, payload, { responseType: 'text' }).pipe(
      // seta o Signal global newUserName com o login do usuário que resetou a senha
      // Essa informação aparece na tela de login. O usuário só vai digitar a SENHA
      tap(() => this.loginStateService.newUserName.set(decoded.username)),
      catchError((error) => {
        console.error('Erro ao redefinir senha:', error);
        // Pode ser token expirado ou inválido
        return throwError(() => new Error('Link inválido ou expirou. Solicite novamente.'));
      })
    );
  }

  resetPasswordByAdmin(userId: number | undefined): Observable<{ temporaryPassword: string }> {
    return this.http.post<{ temporaryPassword: string }>(
      `${environment.apiUrl}/api/v1/usuarios/${userId}/reset-password`,
      {}
    ).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('Erro ao resetar a senha', err.error);
        const msg = err.error?.message || 'Falha ao processar solcitação';
        return throwError(() => new Error(msg));
      })
    );
  }

  forcePasswordChange(userName: string, newPassword: string): Observable<void> {
    const payload = { userName, newPassword };

    return this.http.post<void>(`${environment.apiUrl}/api/v1/auth/force-password-change`, payload)
      .pipe(catchError((err: HttpErrorResponse) => {
        console.error('Erro ao forçar mudança de senha', err.error);
        const msg = err.error?.message || 'Erro ao processar solicitação';
        return throwError(() => new Error(msg));
      }));
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
            isForcePasswordChange: decoded.isForcePasswordChange
          };
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  }

  // ✨ NOVO MÉTODO: Valida o token sem tentar trocar a senha
  validateResetToken(token: string): Observable<any> {
    const url = `${this.API_URL}/auth/validate-reset-token`;

    // Passamos o token como Query Param (?token=...)
    return this.http.get(url, { params: { token } }).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('Erro ao validar token', err.error);
        // Se o backend retornar erro, capturamos a mensagem para o Snackbar
        const msg = err.error?.message || 'Link expirado ou inválido.';
        return throwError(() => new Error(msg));
      })
    );
  }
}
