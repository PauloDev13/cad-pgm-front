import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { BaseEntityDTO } from '../models/servidor.model';

@Injectable({
  providedIn: 'root',
})
export class DominioService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1`;

  getCargos(): Observable<BaseEntityDTO[]> {
    return this.http.get<BaseEntityDTO[]>(`${this.baseUrl}/cargos`);
  }

  getSetores(): Observable<BaseEntityDTO[]> {
    return this.http.get<BaseEntityDTO[]>(`${this.baseUrl}/setores`);
  }

  getStatus(): Observable<BaseEntityDTO[]> {
    return this.http.get<BaseEntityDTO[]>(`${this.baseUrl}/status`);
  }

  getVinculos(): Observable<BaseEntityDTO[]> {
    return this.http.get<BaseEntityDTO[]>(`${this.baseUrl}/vinculos`);
  }
}
