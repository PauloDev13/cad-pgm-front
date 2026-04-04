import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
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

  readonly vinclos: BaseEntityDTO[] = [
    { id: 1, nome: 'Efetivo' },
    { id: 2, nome: 'Comissionado' },
    { id: 3, nome: 'Terceirizado' },
  ];

  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1`;

  getCargos(): Observable<BaseEntityDTO[]> {
    return this.http.get<BaseEntityDTO[]>(`${this.baseUrl}/cargos/select`);
  }

  getSetores(): Observable<BaseEntityDTO[]> {
    return this.http.get<BaseEntityDTO[]>(`${this.baseUrl}/setores/select`);
  }

  getVinculos(): Observable<BaseEntityDTO[]> {
    return this.http.get<BaseEntityDTO[]>(`${this.baseUrl}/vinculos/select`);
  }

  getSistemas(): Observable<BaseEntityDTO[]> {
    return this.http.get<BaseEntityDTO[]>(`${this.baseUrl}/sistemas/select`);
  }

  getProcuradores(): Observable<BaseEntityDTO[]> {
    return this.http.get<BaseEntityDTO[]>(`${this.baseUrl}/procuradores/select`);
  }

  getStatus(): Observable<BaseEntityDTO[]> {
    return this.http.get<BaseEntityDTO[]>(`${this.baseUrl}/status/select`);
  }

  getAliases(): Observable<BaseEntityDTO[]> {
    return this.http.get<BaseEntityDTO[]>(`${this.baseUrl}/alias/select`);
  }

  // Arrays fixos

  getLotacaoList(): Observable<BaseEntityDTO[]> {
    return of(this.lotacaoList).pipe(delay(100));
  }

  getGeneros(): Observable<BaseEntityDTO[]> {
    return of(this.generos).pipe(delay(100));
  }
}
