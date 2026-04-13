import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, of, throwError } from 'rxjs';
import { IRoles, IUsuarioRequest, IUsuarioResponse, roles, TUsuarioUpdate } from '../models/usuario.model';
import { PageResponse } from '../../../shared/model/pagination.model';

@Injectable({
  providedIn: 'root'
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
      })
    );
  }

  create(payload: IUsuarioRequest): Observable<IUsuarioResponse> {
    return this.http.post<IUsuarioResponse>(`${this.API_URL}/usuarios`, payload);
  }

  update(id: number, payload: TUsuarioUpdate): Observable<IUsuarioResponse> {
    return this.http.patch<IUsuarioResponse>(`${this.API_URL}/usuarios/${id}`, payload);
  }

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

    return this.http.get<PageResponse<IUsuarioResponse[]>>(`${this.API_URL}/usuarios/searchFilter`, {
      params
    });
  }

  getRoles(): Observable<IRoles> {
    return of(roles);
  }
}
