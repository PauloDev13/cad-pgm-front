import { inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { CustomSearchFilterService } from '../custom-search-filter.service';
import { environment } from '../../../../environments/environment';
import { catchError, Observable, throwError } from 'rxjs';
import { PageResponse } from '../../model/pagination.model';

export abstract class BaseGenericService<TReq, TRes> {
  // Injeção de dependências
  protected readonly http = inject(HttpClient);
  protected readonly searchService = inject(CustomSearchFilterService);
  protected readonly baseUrl = `${environment.apiUrl}/api/v1`;

  // OBRIGA o serviço filho a dizer qual é o seu endpoint (ex: 'cargos')
  protected abstract get endpoint(): string;

  findAll(page: number, size: number): Observable<PageResponse<TRes[]>> {
    let params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<TRes[]>>(`${this.baseUrl}/${this.endpoint}`, {
      params
    }).pipe(
      catchError((err: HttpErrorResponse) => {
        const msg = err.error.message || err.error || 'Erro';
        return throwError(() => new Error(msg));
      })
    );
  }

  searchFilter(page: number, size: number, nome?: string): Observable<PageResponse<TRes[]>> {
    return this.searchService.searchFilter<TRes[]>(page, size, this.endpoint, nome)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          const msg = err.error.message || err.error || 'Erro';
          return throwError(() => new Error(msg));
        })
      );
  }

  create(payload: TReq): Observable<TRes> {
    return this.http.post<TRes>(`${this.baseUrl}/${this.endpoint}`, payload)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          const msg = err.error.message || err.error || 'Erro';
          return throwError(() => new Error(msg));
        })
      );
  }

  update(id: number, payload: TReq): Observable<TRes> {
    return this.http.put<TRes>(`${this.baseUrl}/${this.endpoint}/${id}`, payload)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          const msg = err.error.message || err.error || 'Erro';
          return throwError(() => new Error(msg));
        })
      );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${this.endpoint}/${id}`)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          const msg = err.error.message || err.error || 'Erro';
          return throwError(() => new Error(msg));
        })
      );
  }
}
