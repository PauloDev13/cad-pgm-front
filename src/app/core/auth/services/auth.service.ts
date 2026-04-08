import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { IAuthRequest, IAuthResponse } from '../models/auth.model';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  currentUser = signal<IAuthResponse | null>(null);
  // A chave que usaremos para guardar o usuário logado no localstorage
  private readonly AUTH_KEY = 'sistema_logged_user';
  private API_URL = `${environment.apiUrl}/api/v1`;
  private readonly plataformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);

  constructor() {
    this.currentUser.set(this.getStoredLoggedUser());
  }

  // Método de Login simulando uma requisição HTTP
  login(payload: IAuthRequest): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(`${this.API_URL}/auth/login`, payload).pipe(
      tap((response) => {
        this.currentUser.set(response);

        if (isPlatformBrowser(this.plataformId)) {
          localStorage.setItem(this.AUTH_KEY, JSON.stringify(response));
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
      localStorage.removeItem(this.AUTH_KEY);
    }
  }

  // MÉTHOD PRIVADO PARA BUSCAR O USUÁRIO LOGADO NO LOCALSTORAGE
  private getStoredLoggedUser(): IAuthResponse | null {
    if (isPlatformBrowser(this.plataformId)) {
      const stored = localStorage.getItem(this.AUTH_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  }
}
