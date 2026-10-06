import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { RelatorioService } from '../services/relatorio.service';
import { ErrorHandlerService } from '../../../shared/service/error-handler.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, finalize, pipe, switchMap, tap } from 'rxjs';
import { ProcuradorVinculoResponse } from '../models/certificado-vinculo.model';

interface CertificadosVinculadosState {
  vinculos: ProcuradorVinculoResponse[];
  loading: boolean;
}

const initialState: CertificadosVinculadosState = {
  vinculos: [],
  loading: false
};

export const CertificadosVinculadosStore = signalStore(
  withState(initialState),
  withComputed((store) => ({
    totalVinculos: computed(() => store.vinculos().length)
  })),
  withMethods((
    store,
    relatorioService = inject(RelatorioService),
    errorHandler = inject(ErrorHandlerService)
  ) => ({
    carregar: rxMethod<string[]>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap((procuradores) =>
          relatorioService.getCertificadosVinculados(procuradores).pipe(
            tap((vinculos) => patchState(store, { vinculos })),
            catchError((error) => {
              errorHandler.handle(error, 'Certificados Vinculados');
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
