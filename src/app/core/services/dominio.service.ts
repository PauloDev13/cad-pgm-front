import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { delay, Observable, of } from 'rxjs';
import { BaseEntityDTO } from '../models/servidor.model';

@Injectable({
  providedIn: 'root',
})
export class DominioService {
  readonly lotacaoList: BaseEntityDTO[] = [
    { id: 1, nome: 'PGM' },
    { id: 2, nome: 'Cedido' },
  ];

  readonly generos: BaseEntityDTO[] = [
    { id: 1, nome: 'Masculino' },
    { id: 2, nome: 'Feminino' },
    { id: 3, nome: 'Outros' },
  ];

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

  getLotacaoList(): Observable<BaseEntityDTO[]> {
    return of(this.lotacaoList).pipe(delay(300));
  }

  getGeneros(): Observable<BaseEntityDTO[]> {
    return of(this.generos).pipe(delay(300));
  }
}
