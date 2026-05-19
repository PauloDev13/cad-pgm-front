import { inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CustomSearchFilterService } from '../custom-search-filter.service';
import { environment } from '../../../../environments/environment';
import { catchError, Observable, tap } from 'rxjs';
import { PageResponse } from '../../model/pagination.model';
import { customHandlerError } from '../../utils/custom-handler-error';

export abstract class BaseGenericService<TReq, TRes> {
  // Injeção de dependências
  protected readonly http = inject(HttpClient);
  protected readonly searchService = inject(CustomSearchFilterService);
  protected readonly baseUrl = `${environment.apiUrl}/api/v1`;

  // OBRIGA o serviço filho a dizer qual é o seu endpoint (ex: 'cargos')
  protected abstract get endpoint(): string;

  // O Gancho (Hook): Um método vazio que os filhos PODEM implementar se quiserem
  protected onDataMutated(): void {
  };

  findAll(page: number, size: number): Observable<PageResponse<TRes[]>> {
    let params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<TRes[]>>(`${this.baseUrl}/${this.endpoint}`, {
      params
    }).pipe(catchError(customHandlerError));
  }

  searchFilter(page: number, size: number, nome?: string): Observable<PageResponse<TRes[]>> {
    return this.searchService.searchFilter<TRes[]>(page, size, this.endpoint, nome)
      .pipe(catchError(customHandlerError));
  }

  create(payload: TReq): Observable<TRes> {
    return this.http.post<TRes>(`${this.baseUrl}/${this.endpoint}`, payload)
      .pipe(
        // Em caso de sucesso, chama o hook que limpa o cache
        tap(() => this.onDataMutated()),
        catchError(customHandlerError)
      );
  }

  update(id: number, payload: TReq): Observable<TRes> {
    return this.http.put<TRes>(`${this.baseUrl}/${this.endpoint}/${id}`, payload)
      .pipe(
        // Em caso de sucesso, chama o hook que limpa o cache
        tap(() => this.onDataMutated()),
        catchError(customHandlerError)
      );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${this.endpoint}/${id}`)
      .pipe(catchError(customHandlerError));
  }
}
