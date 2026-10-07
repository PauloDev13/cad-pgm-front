import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { RelatorioService } from '../services/relatorio.service';
import { ErrorHandlerService } from '../../../shared/service/error-handler.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, finalize, pipe, switchMap, tap } from 'rxjs';
import { ProcuradorVinculoResponse } from '../models/certificado-vinculo.model';
import { SistemaVinculoResponse } from '../models/sistema-vinculo.model';
import { AniversarianteModel } from '../models/aniversariente.model';

interface RelatoriosState {
  certificados: ProcuradorVinculoResponse[];
  sistemas: SistemaVinculoResponse[];
  aniversariantes: AniversarianteModel[];
  loading: boolean;
}

const initialState: RelatoriosState = {
  certificados: [],
  sistemas: [],
  aniversariantes: [],
  loading: false
};

export const RelatoriosStore = signalStore(
  withState(initialState),
  withComputed((store) => ({
    totalVinculos: computed(() => store.certificados().length)
  })),
  withMethods((
    store,
    relatorioService = inject(RelatorioService),
    errorHandler = inject(ErrorHandlerService)
  ) => ({
    carregarAniversariantes: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap((month) =>
          relatorioService.getAniversariantesMes(month).pipe(
            tap((aniversariantes) =>
              patchState(store, { aniversariantes })
            ),
            catchError((error) => {
              errorHandler.handle(error, 'Aniversariantes');
              patchState(store, { aniversariantes: [] });
              return EMPTY;
            }),
            finalize(() => patchState(store, { loading: false }))
          )
        )
      )
    ),

    carregarVinculosCertificado: rxMethod<string[]>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap((procuradores) =>
          relatorioService.getCertificadosVinculados(procuradores).pipe(
            tap((certificados) => patchState(store, { certificados })),
            catchError((error) => {
              errorHandler.handle(error, 'Certificados Vinculados');
              patchState(store, { certificados: [] });
              return EMPTY;
            }),
            finalize(() => patchState(store, { loading: false }))
          )
        )
      )
    ),

    carregarVinculoSistema: rxMethod<string[]>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap((sistemas) =>
          relatorioService.getSistemasVinculados(sistemas).pipe(
            tap((sistemas) => patchState(store, { sistemas })),
            catchError((error) => {
              errorHandler.handle(error, 'Sistemas Vinculados');
              patchState(store, { sistemas: [] });
              return EMPTY;
            }),
            finalize(() => patchState(store, { loading: false }))
          )
        )
      )
    )
  }))
);
