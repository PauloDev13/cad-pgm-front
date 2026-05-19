import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { catchError, delay, Observable, of, shareReplay } from 'rxjs';
import { BaseEntityDTO } from '../models/servidor.model';
import { customHandlerError } from '../../../shared/utils/custom-handler-error';

// dominio.models.ts
export type domainType =
  'alias' | 'cargo' | 'procurador' | 'sistema' | 'status' | 'setor' | 'vinculo';

@Injectable({
  providedIn: 'root'
})
export class DominioService {

  readonly lotacaoList: BaseEntityDTO[] = [
    { id: 1, nome: 'PGM' },
    { id: 2, nome: 'Cedido' }
  ];

  readonly generos: any[] = [
    { id: 'Masculino', nome: 'Masculino' },
    { id: 'Feminino', nome: 'Feminino' },
    { id: 'Outros', nome: 'Outros' }
  ];

  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1`;
  private statusCache$: Observable<BaseEntityDTO[]> | null = null;
  private cargoCache$: Observable<BaseEntityDTO[]> | null = null;
  private setorCache$: Observable<BaseEntityDTO[]> | null = null;
  private procuradorCache$: Observable<BaseEntityDTO[]> | null = null;
  private aliasCache$: Observable<BaseEntityDTO[]> | null = null;
  private vinculoCache$: Observable<BaseEntityDTO[]> | null = null;
  private sistemaCache$: Observable<BaseEntityDTO[]> | null = null;

  getCargos(): Observable<BaseEntityDTO[]> {
    if (!this.cargoCache$) {
      this.cargoCache$ = this.http.get<BaseEntityDTO[]>(`${(this.baseUrl)}/cargos/select`)
        .pipe(
          catchError((err) => {
            this.cargoCache$ = null;
            return customHandlerError(err);
          }),
          // Coloca os dados no cache para serem usados da próxima vez
          shareReplay(1)
        );
    }
    return this.cargoCache$;
  }

  getSetores(): Observable<BaseEntityDTO[]> {
    if (!this.setorCache$) {
      this.setorCache$ = this.http.get<BaseEntityDTO[]>(`${this.baseUrl}/setores/select`)
        .pipe(
          catchError((err) => {
            this.setorCache$ = null;
            return customHandlerError(err);
          }),
          shareReplay(1)
        );
    }
    return this.setorCache$;
  }

  getVinculos(): Observable<BaseEntityDTO[]> {
    if (!this.vinculoCache$) {
      this.vinculoCache$ = this.http.get<BaseEntityDTO[]>(`${this.baseUrl}/vinculos/select`)
        .pipe(
          catchError((err) => {
            this.setorCache$ = null;
            return customHandlerError(err);
          }),
          shareReplay(1)
        );
    }
    return this.vinculoCache$;
  }

  getSistemas(): Observable<BaseEntityDTO[]> {
    if (!this.sistemaCache$) {
      this.sistemaCache$ = this.http.get<BaseEntityDTO[]>(`${this.baseUrl}/sistemas/select`)
        .pipe(
          catchError((err) => {
            this.setorCache$ = null;
            return customHandlerError(err);
          }),
          shareReplay(1)
        );
    }
    return this.sistemaCache$;
  }

  getProcuradores(): Observable<BaseEntityDTO[]> {
    if (!this.procuradorCache$) {
      this.procuradorCache$ = this.http.get<BaseEntityDTO[]>(`${this.baseUrl}/procuradores/select`)
        .pipe(
          catchError((err) => {
            this.setorCache$ = null;
            return customHandlerError(err);
          }),
          shareReplay(1)
        );
    }
    return this.procuradorCache$;
  }

  getStatus(): Observable<BaseEntityDTO[]> {
    if (!this.statusCache$) {
      this.statusCache$ = this.http.get<BaseEntityDTO[]>(`${this.baseUrl}/status/select`)
        .pipe(
          catchError((err) => {
            this.statusCache$ = null;
            return customHandlerError(err);
          }),
          shareReplay(1)
        );
    }
    return this.statusCache$;
  }

  getAliases(): Observable<BaseEntityDTO[]> {
    if (!this.aliasCache$) {
      this.aliasCache$ = this.http.get<BaseEntityDTO[]>(`${this.baseUrl}/alias/select`)
        .pipe(
          catchError((err) => {
            this.statusCache$ = null;
            return customHandlerError(err);
          }),
          shareReplay(1)
        );
    }
    return this.aliasCache$;
  }

  // Arrays fixos
  getLotacaoList(): Observable<BaseEntityDTO[]> {
    return of(this.lotacaoList).pipe(delay(100));
  }

  getGeneros(): Observable<BaseEntityDTO[]> {
    return of(this.generos).pipe(delay(100));
  }

  // Limpa o cache das entidades de domínio se for cadastrado
  // ou atualizado algum dado para forçar a ida ao backend
  clearCache(type: domainType) {
    switch (type) {
      case 'alias':
        this.aliasCache$ = null;
        break;
      case 'cargo':
        this.cargoCache$ = null;
        break;
      case 'procurador':
        this.procuradorCache$ = null;
        break;
      case 'setor':
        this.setorCache$ = null;
        break;
      case 'sistema':
        this.sistemaCache$ = null;
        break;
      case 'status':
        this.statusCache$ = null;
        break;
      case 'vinculo':
        this.vinculoCache$ = null;
        break;
      default:
        console.warn(`Tipo de domínio desconhecido para cache: ${type}`);
    }
  }
}
