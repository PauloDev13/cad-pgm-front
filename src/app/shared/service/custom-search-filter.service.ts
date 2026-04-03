import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { PageResponse } from '../../core/models/pagination.model';

@Injectable({
  providedIn: 'root',
})
export class CustomSearchFilterService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1`;

  searchFilter<T>(
    page: number,
    size: number,
    endpoint: string,
    term?: string,
  ): Observable<PageResponse<T>> {
    let params = new HttpParams().set('page', page).set('size', size);

    if (term && term.trim() !== 'nome') {
      params = params.set('nome', term.trim());
    }

    if (term && term.trim() !== 'descricao') {
      params = params.set('descricao', term.trim());
    }

    if (term && term.trim() !== 'email') {
      params = params.set('email', term.trim());
    }

    return this.http.get<PageResponse<T>>(`${this.baseUrl}/${endpoint}/searchFilter`, {
      params,
    });
  }
}
