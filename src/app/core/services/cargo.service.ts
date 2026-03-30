import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { CargoRequestDTO, CargoResponseDTO } from '../models/cargo.model';
import { PageResponse } from '../models/pagination.model';
import { CustomSearchFilterService } from '../../shared/service/custom-search-filter.service';

@Injectable({
  providedIn: 'root',
})
export class CargoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1`;
  private readonly searchService = inject(CustomSearchFilterService);

  findAll(page: number, size: number): Observable<PageResponse<CargoResponseDTO[]>> {
    let params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<CargoResponseDTO[]>>(`${this.baseUrl}/cargos`, {
      params,
    });
  }

  searchFilter(
    page: number,
    size: number,
    nome?: string,
  ): Observable<PageResponse<CargoResponseDTO[]>> {
    return this.searchService.searchFilter<CargoResponseDTO[]>(page, size, 'cargos', nome);
  }

  create(cargo: CargoRequestDTO): Observable<CargoResponseDTO> {
    return this.http.post<CargoResponseDTO>(`${this.baseUrl}/cargos`, cargo);
  }

  update(id: number, cargo: CargoRequestDTO): Observable<CargoResponseDTO> {
    return this.http.put<CargoResponseDTO>(`${this.baseUrl}/cargos/${id}`, cargo);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/cargos/${id}`);
  }
}
