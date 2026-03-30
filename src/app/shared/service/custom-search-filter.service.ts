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
    nome?: string,
  ): Observable<PageResponse<T>> {
    let params = new HttpParams().set('page', page).set('size', size);

    if (nome && nome.trim() !== '') {
      params = params.set('nome', nome.trim());
    }

    return this.http.get<PageResponse<T>>(`${this.baseUrl}/${endpoint}/searchFilter`, {
      params,
    });
  }
}
