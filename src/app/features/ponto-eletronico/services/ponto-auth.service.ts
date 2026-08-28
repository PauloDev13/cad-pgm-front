import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthResponse, LoginRequest } from '../models/ponto-eletronico.model';

@Injectable({ providedIn: 'root' })
export class PontoAuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/python-api/api/v1/auth';
  private readonly opts = { withCredentials: true } as const;

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, payload, this.opts);
  }

  logout(): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`${this.baseUrl}/logout`, {}, this.opts);
  }

  checkSession(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.baseUrl}/me`, this.opts);
  }
}
