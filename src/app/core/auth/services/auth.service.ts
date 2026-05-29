import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  IAuthRequest,
  IAuthResponse,
  IForgotPasswordRequest,
  IRegisterUserRequest,
  IRegisterUserResponse,
  IResetPasswordRequest
} from '../models/auth.model';
import { customHandlerError } from '../../../shared/utils/custom-handler-error';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  readonly TOKEN_KEY = 'jwt-token';
  private readonly API_URL = `${environment.apiUrl}/api/v1`;
  private readonly http = inject(HttpClient);

  // Méthod de Login
  login(payload: IAuthRequest): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(`${this.API_URL}/auth/login`, payload).pipe(
      catchError(customHandlerError)
    );
  }

  // Limpa o estado global ao sair do sistema
  logout(): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/auth/logout`, {});
  }

  // O próprio usuário pode criar seu cadastro
  registerNewUserPublic(newUser: IRegisterUserRequest): Observable<IRegisterUserResponse> {
    return this.http.post<IRegisterUserResponse>(`${this.API_URL}/auth/register`, newUser).pipe(
      catchError(customHandlerError)
    );
  }

  // Solicita o envio do e-mail de recuperação
  forgotPassword(email: string): Observable<any> {
    const payload: IForgotPasswordRequest = { email };

    // Como o retorno provavelmente é apenas um 200 OK genérico, tipamos como 'any' ou 'void'
    return this.http.post(`${environment.apiUrl}/api/v1/auth/forgot-password`, payload,
      { responseType: 'text' })
      .pipe(
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

  // reseta a senha
  resetPassword(token: string, newPassword: string): Observable<any> {
    const payload: IResetPasswordRequest = { token, newPassword };

    return this.http.post(`${environment.apiUrl}/api/v1/auth/reset-password`, payload,
      { responseType: 'text' })
      .pipe(catchError(customHandlerError));
  }

  resetPasswordByAdmin(userId: number | undefined): Observable<{ temporaryPassword: string }> {
    return this.http.post<{ temporaryPassword: string }>(
      `${environment.apiUrl}/api/v1/usuarios/${userId}/reset-password`, {}
    ).pipe(catchError(customHandlerError));
  }

  forcePasswordChange(userName: string, newPassword: string): Observable<void> {
    const payload = { userName, newPassword };

    return this.http.post<void>(`${environment.apiUrl}/api/v1/auth/force-password-change`, payload)
      .pipe(catchError(customHandlerError));
  }

  // ✨ NOVO MÉTODO: Valida o token sem tentar trocar a senha
  validateResetToken(token: string): Observable<any> {
    // Passamos o token como Query Param (?token=...)
    return this.http.get(`${this.API_URL}/auth/validate-reset-token`, { params: { token } })
      .pipe(catchError(customHandlerError));
  }
}
