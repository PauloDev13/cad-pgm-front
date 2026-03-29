import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { SetorRequestDTO, SetorResponseDTO } from '../models/setor.model';

@Injectable({
  providedIn: 'root',
})
export class SetorService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/setores`;

  findAll(): Observable<SetorResponseDTO[]> {
    return this.http.get<SetorResponseDTO[]>(`${this.baseUrl}`);
  }

  create(Setor: SetorRequestDTO): Observable<SetorResponseDTO> {
    return this.http.post<SetorResponseDTO>(this.baseUrl, Setor);
  }

  update(id: number, Setor: SetorRequestDTO): Observable<SetorResponseDTO> {
    return this.http.put<SetorResponseDTO>(`${this.baseUrl}/${id}`, Setor);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
