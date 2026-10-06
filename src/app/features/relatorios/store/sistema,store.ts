import { SistemaVinculoResponse } from '../models/sistema-vinculo.model';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { RelatorioService } from '../services/relatorio.service';
import { ErrorHandlerService } from '../../../shared/service/error-handler.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, finalize, pipe, switchMap, tap } from 'rxjs';

interface SistemasVinculadosState {
  vinculos: SistemaVinculoResponse[];
  loading: boolean;
}

const initialState: SistemasVinculadosState = {
  vinculos: [],
  loading: false
};

export const SistemasVinculadosStore = signalStore(
  withState(initialState),
  withComputed((store) => ({
    totalSistemas: computed(() => store.vinculos().length)
  })),
  withMethods((
    store,
    relatorioService = inject(RelatorioService),
    errorHandler = inject(ErrorHandlerService)
  ) => ({
    carregar: rxMethod<string[]>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap((sistemas) =>
          relatorioService.getSistemasVinculados(sistemas).pipe(
            tap((vinculos) => patchState(store, { vinculos })),
            catchError((error) => {
              errorHandler.handle(error, 'Sistemas Vinculados');
              patchState(store, { vinculos: [] });
              return EMPTY;
            }),
            finalize(() => patchState(store, { loading: false }))
          )
        )
      )
    )
  }))
);
