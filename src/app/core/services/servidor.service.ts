import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { PageResponse } from '../models/pagination.model';
import { ServidorRequestDTO, ServidorResponseDTO } from '../models/servidor.model';

@Injectable({
  providedIn: 'root',
})
export class ServidorService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/servidores`;

  findAll(page: number = 0, size: number = 10): Observable<PageResponse<ServidorResponseDTO>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<ServidorResponseDTO>>(this.apiUrl, { params });
  }

  findById(id: number): Observable<ServidorResponseDTO> {
    return this.http.get<ServidorResponseDTO>(`${this.apiUrl}/${id}`);
  }

  findByCpfOrRegistration(search: string): Observable<ServidorResponseDTO[]> {
    const params = new HttpParams().set('search', search);
    return this.http.get<ServidorResponseDTO[]>(`${this.apiUrl}/search`, { params });
  }

  create(data: ServidorRequestDTO): Observable<ServidorResponseDTO> {
    return this.http.post<ServidorResponseDTO>(this.apiUrl, data);
  }

  update(id: number, data: ServidorRequestDTO): Observable<ServidorResponseDTO> {
    return this.http.put<ServidorResponseDTO>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

}
