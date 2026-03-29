import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { CargoRequestDTO, CargoResponseDTO } from '../models/cargo.model';

@Injectable({
  providedIn: 'root',
})
export class CargoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/cargos`;

  findAll(): Observable<CargoResponseDTO[]> {
    return this.http.get<CargoResponseDTO[]>(`${this.baseUrl}`);
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
