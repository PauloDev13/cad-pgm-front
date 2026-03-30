import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { SetorRequestDTO, SetorResponseDTO } from '../models/setor.model';
import { PageResponse } from '../models/pagination.model';
import { CustomSearchFilterService } from '../../shared/service/custom-search-filter.service';

@Injectable({
  providedIn: 'root',
})
export class SetorService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1`;
  private readonly searchService = inject(CustomSearchFilterService);
  private readonly endpoint: string = 'setores';

  findAll(page: number, size: number): Observable<PageResponse<SetorResponseDTO[]>> {
    let params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<SetorResponseDTO[]>>(`${this.baseUrl}/${this.endpoint}`, {
      params,
    });
  }

  searchFilter(
    page: number,
    size: number,
    nome?: string,
  ): Observable<PageResponse<SetorResponseDTO[]>> {
    return this.searchService.searchFilter<SetorResponseDTO[]>(page, size, this.endpoint, nome);
  }

  create(Setor: SetorRequestDTO): Observable<SetorResponseDTO> {
    return this.http.post<SetorResponseDTO>(`${this.baseUrl}/${this.endpoint}`, Setor);
  }

  update(id: number, Setor: SetorRequestDTO): Observable<SetorResponseDTO> {
    return this.http.put<SetorResponseDTO>(`${this.baseUrl}/${this.endpoint}/${id}`, Setor);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${this.endpoint}/${id}`);
  }
}
