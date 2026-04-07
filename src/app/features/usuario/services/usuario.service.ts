import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { IUsuarioRequest, IUsuarioResponse } from '../models/usuario.model';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private API_URL = `${environment.apiUrl}/api/v1`;
  private readonly http = inject(HttpClient);

  register(newUser: IUsuarioRequest): Observable<IUsuarioResponse> {
    return this.http.post<IUsuarioResponse>(`${this.API_URL}/usuarios`, newUser).pipe(
      catchError((error) => {
        console.error('Erro ao cadastrar usuário:', error);
        const msg = error.error?.message || 'Erro ao cadastrar usuário';
        return throwError(() => new Error(msg));
      }),
    );
  }
}
