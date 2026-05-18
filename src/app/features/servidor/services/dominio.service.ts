import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { catchError, delay, Observable, of, throwError } from 'rxjs';
import { BaseEntityDTO } from '../models/servidor.model';

@Injectable({
  providedIn: 'root'
})
export class DominioService {
  readonly lotacaoList: BaseEntityDTO[] = [
    { id: 1, nome: 'PGM' },
    { id: 2, nome: 'Cedido' }
  ];

  readonly generos: any[] = [
    { id: 'Masculino', nome: 'Masculino' },
    { id: 'Feminino', nome: 'Feminino' },
    { id: 'Outros', nome: 'Outros' }
  ];

  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1`;

  getCargos(): Observable<BaseEntityDTO[]> {
    return this.http.get<BaseEntityDTO[]>(`${this.baseUrl}/cargos/select`)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          const msg = err.error.message || err.error || 'Erro ao buscar Cargos';
          return throwError(() => new Error(msg));
        })
      );
  }

  getSetores(): Observable<BaseEntityDTO[]> {
    return this.http.get<BaseEntityDTO[]>(`${this.baseUrl}/setores/select`)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          const msg = err.error.message || err.error || 'Erro ao buscar Setores';
          return throwError(() => new Error(msg));
        })
      );
  }

  getVinculos(): Observable<BaseEntityDTO[]> {
    return this.http.get<BaseEntityDTO[]>(`${this.baseUrl}/vinculos/select`)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          const msg = err.error.message || err.error || 'Erro ao buscar Vínculos';
          return throwError(() => new Error(msg));
        })
      );
  }

  getSistemas(): Observable<BaseEntityDTO[]> {
    return this.http.get<BaseEntityDTO[]>(`${this.baseUrl}/sistemas/select`)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          const msg = err.error.message || err.error || 'Erro ao buscar Sistemas';
          return throwError(() => new Error(msg));
        })
      );
  }

  getProcuradores(): Observable<BaseEntityDTO[]> {
    return this.http.get<BaseEntityDTO[]>(`${this.baseUrl}/procuradores/select`)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          const msg = err.error.message || err.error || 'Erro ao buscar procuradores';
          return throwError(() => new Error(msg));
        })
      );
  }

  getStatus(): Observable<BaseEntityDTO[]> {
    return this.http.get<BaseEntityDTO[]>(`${this.baseUrl}/status/select`)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          const msg = err.error.message || err.error || 'Erro buscar Status';
          return throwError(() => new Error(msg));
        })
      );
  }

  getAliases(): Observable<BaseEntityDTO[]> {
    return this.http.get<BaseEntityDTO[]>(`${this.baseUrl}/alias/select`)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          const msg = err.error.message || err.error || 'Erro ao buscar Aliases';
          return throwError(() => new Error(msg));
        })
      );
  }

  // Arrays fixos
  getLotacaoList(): Observable<BaseEntityDTO[]> {
    return of(this.lotacaoList).pipe(delay(100));
  }

  getGeneros(): Observable<BaseEntityDTO[]> {
    return of(this.generos).pipe(delay(100));
  }
}
