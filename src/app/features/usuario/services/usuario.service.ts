import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, Observable, of, throwError } from 'rxjs';
import {
  IRoles,
  IUsuarioRequest,
  IUsuarioResponse,
  roles,
  TUsuarioUpdate,
  TUsuarioUpdatePut
} from '../models/usuario.model';
import { PageResponse } from '../../../shared/model/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private API_URL = `${environment.apiUrl}/api/v1/usuarios`;

  // Usado no cadastro realizado pelo próprio usuário
  register(newUser: IUsuarioRequest): Observable<IUsuarioResponse> {
    return this.http.post<IUsuarioResponse>(`${this.API_URL}`, newUser).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('Erro ao processar solicitação:', err.error);
        const msg = err.error?.message || 'Erro ao processar solicitação';
        return throwError(() => new Error(msg));
      })
    );
  }

  // Usado no cadastro de novo usuário pelo Administrador
  create(payload: IUsuarioRequest): Observable<IUsuarioResponse> {
    return this.http.post<IUsuarioResponse>(`${this.API_URL}`, payload)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          console.error('Erro ao processar solicitação:', err.error);
          const msg = err.error?.message || 'Erro ao processar solicitação';
          return throwError(() => new Error(msg));
        })
      );
  }

  // Usado para atualizar dados do usuário, sem atualizar a senha
  updatePatch(id: number, payload: TUsuarioUpdate): Observable<IUsuarioResponse> {
    return this.http.patch<IUsuarioResponse>(`${this.API_URL}/${id}`, payload)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          console.error('Erro ao processar solicitação:', err.error);
          const msg = err.error?.message || 'Erro ao processar solicitação';
          return throwError(() => new Error(msg));
        })
      );
  }

  // Usado para atualizar dados do usuário, inclusive a senha
  updatePut(id: number, payload: TUsuarioUpdatePut): Observable<IUsuarioResponse> {
    return this.http.put<IUsuarioResponse>(`${this.API_URL}/${id}`, payload)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          console.error('Erro ao processar solicitação:', err.error);
          const msg = err.error?.message || 'Erro ao processar solicitação';
          return throwError(() => new Error(msg));
        })
      );
  }

  delete(payload: IUsuarioResponse): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${payload.id}`)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          console.error('Erro ao processar solicitação:', err.error);
          const msg = err.error?.message || 'Erro ao processar solicitação';
          return throwError(() => new Error(msg));
        })
      );
  }

  // Pesquisa de usuários com filtro
  searchFilter(
    page: number,
    size: number,
    name?: string,
    userName?: string,
    email?: string
  ): Observable<PageResponse<IUsuarioResponse[]>> {
    let params = new HttpParams().set('page', page).set('size', size);

    if (name !== null && name !== undefined) {
      params = params.set('name', name.toString());
    }

    if (userName && userName.trim() !== '') {
      params = params.set('userName', userName.trim());
    }

    if (email && email.trim() !== '') {
      params = params.set('email', email.trim());
    }

    return this.http.get<PageResponse<IUsuarioResponse[]>>(`${this.API_URL}/searchFilter`, {
      params
    }).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('Erro ao processar solicitação:', err.error);
        const msg = err.error?.message || 'Erro ao processar solicitação';
        return throwError(() => new Error(msg));
      })
    );
  }

  // lê o array com as permissções para usuários
  getRoles(): Observable<IRoles> {
    return of(roles);
  }
}
