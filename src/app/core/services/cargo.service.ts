import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { CargoRequestDTO, CargoResponseDTO } from '../models/cargo.model';
import { PageResponse } from '../models/pagination.model';

@Injectable({
  providedIn: 'root',
})
export class CargoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/cargos`;

  findAll(page: number, size: number): Observable<PageResponse<CargoResponseDTO[]>> {
    let params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<CargoResponseDTO[]>>(`${this.baseUrl}`, {
      params,
    });
  }

  searchFilter(
    page: number,
    size: number,
    nome?: string,
  ): Observable<PageResponse<CargoResponseDTO[]>> {
    let params = new HttpParams().set('page', page).set('size', size);

    console.log(nome);

    if (nome && nome.trim() !== '') {
      params = params.set('nome', nome.trim());
    }

    return this.http.get<PageResponse<CargoResponseDTO[]>>(`${this.baseUrl}/searchFilter`, {
      params,
    });
  }

  create(cargo: CargoRequestDTO): Observable<CargoResponseDTO> {
    return this.http.post<CargoResponseDTO>(this.baseUrl, cargo);
  }

  update(id: number, cargo: CargoRequestDTO): Observable<CargoResponseDTO> {
    return this.http.put<CargoResponseDTO>(`${this.baseUrl}/${id}`, cargo);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
