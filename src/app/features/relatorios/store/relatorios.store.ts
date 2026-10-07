import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { RelatorioService } from '../services/relatorio.service';
import { ErrorHandlerService } from '../../../shared/service/error-handler.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, distinctUntilChanged, EMPTY, finalize, pipe, switchMap, tap } from 'rxjs';
import { ProcuradorVinculoResponse } from '../models/certificado-vinculo.model';
import { SistemaVinculoResponse } from '../models/sistema-vinculo.model';
import { AniversarianteModel } from '../models/aniversariente.model';
import { FolhaPontoSetorDTO } from '../models/folha-ponto.model';
import { FeriadoResponseDTO } from '../../feriado/models/feriado.model';
import { FeriadoService } from '../../feriado/services/feriado.service';

interface RelatoriosState {
  certificados: ProcuradorVinculoResponse[];
  sistemas: SistemaVinculoResponse[];
  aniversariantes: AniversarianteModel[];
  loading: boolean;

  folhaPontoDados: FolhaPontoSetorDTO[],
  loadingFolhaPonto: boolean,
  errorFolhaPonto: unknown | null,

  feriados: FeriadoResponseDTO[],
  loadingFeriado: boolean,
  errorFeriado: unknown | null,
}

const initialState: RelatoriosState = {
  certificados: [],
  sistemas: [],
  aniversariantes: [],
  loading: false,

  folhaPontoDados: [],
  loadingFolhaPonto: false,
  errorFolhaPonto: null,

  feriados: [],
  loadingFeriado: false,
  errorFeriado: null
};

export const RelatoriosStore = signalStore(
  withState(initialState),
  withComputed((store) => ({
    totalVinculos: computed(() => store.certificados().length)
  })),
  withMethods((
    store,
    relatorioService = inject(RelatorioService),
    feriadoService = inject(FeriadoService),
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

    carregarFolhaPonto: rxMethod<number[]>(
      pipe(
        distinctUntilChanged((anterior, atual) =>
          anterior.length === atual.length &&
          anterior.every((id, index) => id === atual[index])
        ),
        switchMap((setorIds) => {
          patchState(store, {
            loadingFolhaPonto: true,
            errorFolhaPonto: null
          });
          return relatorioService.gerarFolhaMes(setorIds).pipe(
            tap((folhaPontoDados) => patchState(store, { folhaPontoDados })
            ),
            catchError((error: unknown) => {
              patchState(store, {
                folhaPontoDados: [],
                errorFolhaPonto: error
              });
              errorHandler.handle(error, 'Folha Ponto');
              return EMPTY;
            }),
            finalize(() => patchState(store, { loadingFolhaPonto: false }))
          );
        })
      )
    ),

    carregarFeriados: rxMethod<number>(
      pipe(
        distinctUntilChanged(),
        switchMap((mes) => {
          patchState(store, {
            loadingFeriado: true,
            errorFeriado: null
          });

          return feriadoService.findAtivos(mes).pipe(
            tap((feriados) => patchState(store, { feriados })
            ),
            catchError((error: unknown) => {
              patchState(store, {
                feriados: [],
                errorFeriado: error
              });
              errorHandler.handle(error, 'Feriados');
              return EMPTY;
            }),
            finalize(() => patchState(store, { loadingFeriado: false }))
          );
        })
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
