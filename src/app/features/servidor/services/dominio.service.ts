import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { catchError, delay, of } from 'rxjs';
import { BaseEntityDTO } from '../models/servidor.model';
import { customHandlerError } from '../../../shared/utils/custom-handler-error';
import { rxResource } from '@angular/core/rxjs-interop';

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

  readonly atividades: any[] = [
    { id: 'PRESENCIAL', nome: 'Presencial' },
    { id: 'REMOTO', nome: 'Remoto' },
    { id: 'HIBRIDO', nome: 'Híbrido' }
  ];

  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1`;

  cargosResource = rxResource({
    stream: () => this.http.get<BaseEntityDTO[]>(`${(this.baseUrl)}/cargos/select`)
      .pipe(
        catchError((err) => {
          customHandlerError(err);
          return of([]);
        })
      )
  });

  setoresResource = rxResource({
    stream: () => this.http.get<BaseEntityDTO[]>(`${this.baseUrl}/setores/select`)
      .pipe(
        catchError((err) => {
          customHandlerError(err);
          return of([]);
        })
      )
  });

  vinculosResource = rxResource({
    stream: () => this.http.get<BaseEntityDTO[]>(`${this.baseUrl}/vinculos/select`)
      .pipe(
        catchError((err) => {
          customHandlerError(err);
          return of([]);
        })
      )
  });

  sistemasResource = rxResource({
    stream: () => this.http.get<BaseEntityDTO[]>(`${this.baseUrl}/sistemas/select`)
      .pipe(
        catchError((err) => {
          customHandlerError(err);
          return of([]);
        })
      )
  });

  procuradoresResource = rxResource({
    stream: () => this.http.get<BaseEntityDTO[]>(`${this.baseUrl}/procuradores/select`)
      .pipe(
        catchError((err) => {
          customHandlerError(err);
          return of([]);
        })
      )
  });

  statusResource = rxResource({
    stream: () => this.http.get<BaseEntityDTO[]>(`${this.baseUrl}/status/select`)
      .pipe(
        catchError((err) => {
          customHandlerError(err);
          return of([]);
        })
      )
  });

  aliasesResource = rxResource({
    stream: () => this.http.get<BaseEntityDTO[]>(`${this.baseUrl}/alias/select`)
      .pipe(
        catchError((err) => {
          customHandlerError(err);
          return of([]);
        })
      )
  });

  // Arrays fixos
  lotacoesResource = rxResource({
    stream: () => of(this.lotacaoList).pipe(delay(100))
      .pipe(
        catchError((err) => {
          customHandlerError(err);
          return of([]);
        })
      )
  });

  generosResource = rxResource({
    stream: () => of(this.generos).pipe(delay(100))
      .pipe(
        catchError((err) => {
          customHandlerError(err);
          return of([]);
        })
      )
  });

  atividadesResource = rxResource({
    stream: () => of(this.atividades).pipe(delay(100))
      .pipe(
        catchError((err) => {
          customHandlerError(err);
          return of([]);
        })
      )
  });
}
