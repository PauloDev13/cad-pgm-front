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

  readonly statusList: BaseEntityDTO[] = [
    { id: 1, nome: 'Ativo' },
    { id: 2, nome: 'Inativo' },
    { id: 3, nome: 'Férias' },
    { id: 4, nome: 'Pedente' },
    { id: 5, nome: 'Afastado' },
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
    return this.http.get<BaseEntityDTO[]>(`${this.baseUrl}/vinculos`);
  }

  getSistemas(): Observable<BaseEntityDTO[]> {
    return this.http.get<BaseEntityDTO[]>(`${this.baseUrl}/sistemas/select`);
  }

  getProcuradores(): Observable<BaseEntityDTO[]> {
    return this.http.get<BaseEntityDTO[]>(`${this.baseUrl}/procuradores/select`);
  }

  getAliases(): Observable<BaseEntityDTO[]> {
    return this.http.get<BaseEntityDTO[]>(`${this.baseUrl}/alias/select`);
  }

  // Arrays fixos
  getStatus(): Observable<BaseEntityDTO[]> {
    return of(this.statusList).pipe(delay(300));
    // return this.http.get<BaseEntityDTO[]>(`${this.baseUrl}/status`);
  }

  getLotacaoList(): Observable<BaseEntityDTO[]> {
    return of(this.lotacaoList).pipe(delay(300));
  }

  getGeneros(): Observable<BaseEntityDTO[]> {
    return of(this.generos).pipe(delay(300));
  }
}
