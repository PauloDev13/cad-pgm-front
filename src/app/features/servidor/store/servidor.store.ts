import {
  BaseEntityDTO,
  IServidorExcludedQueryParams,
  IServidorQueryParams,
  ServidorRequestDTO,
  ServidorResponseDTO,
  TServidorDelete
} from '../models/servidor.model';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { ServidorService } from '../services/servidor.service';
import { NotificationService } from '../../../shared/service/NotificationSnackbar.service';
import { ErrorHandlerService } from '../../../shared/service/error-handler.service';
import { DominioService } from '../services/dominio.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { debounceTime, distinctUntilChanged, pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';


type ServidorState = {
  // State do conteúdo dos combos
  status: BaseEntityDTO[];
  cargos: BaseEntityDTO[];
  setores: BaseEntityDTO[];
  vinculos: BaseEntityDTO[],
  lotacoes: BaseEntityDTO[],
  sistemas: BaseEntityDTO[],
  procuradores: BaseEntityDTO[],
  aliases: BaseEntityDTO[],
  atividades: BaseEntityDTO[],
  generos: BaseEntityDTO[]

  // State da seleção feita nos combos
  selectedStatusId: number | null;
  selectedCargoId: number | null;
  selectedSetorId: number | null;

  // State do spinner
  isLoading: boolean;

  // Estado da listagem
  servidores: ServidorResponseDTO[];

  // Estado dos filtros e paginação
  searchTerm: string;
  searchType: 'NOME' | 'CPF' | 'MATRICULA';
  currentPage: number;
  pageSize: number;
  totalElements: number;
  // Gatilho invisível para forçar recarregamento (ex: após deletar)
  reloadTrigger: number;

  // State para os dados de Desligados
  excludedServidores: ServidorResponseDTO[];
  excludedSearchTerm: string;
  excludedSearchType: 'NOME' | 'CPF';
  excludedCurrentPage: number;
  excludedPageSize: number;
  excludedTotalElements: number;
  excludedReloadTrigger: number; // Gatilho independente para a lixeira
}

const initialState: ServidorState = {
  // Inicialização do State para Ativos
  status: [],
  cargos: [],
  setores: [],
  vinculos: [],
  lotacoes: [],
  sistemas: [],
  procuradores: [],
  aliases: [],
  atividades: [],
  generos: [],
  selectedStatusId: null,
  selectedCargoId: null,
  selectedSetorId: null,
  isLoading: false,
  servidores: [],
  searchTerm: '',
  searchType: 'NOME',
  currentPage: 0,
  totalElements: 0,
  pageSize: 10,
  reloadTrigger: 0,

  // Inicialização do State para Desligados
  excludedServidores: [],
  excludedSearchTerm: '',
  excludedSearchType: 'NOME',
  excludedCurrentPage: 0,
  excludedPageSize: 10,
  excludedTotalElements: 0,
  excludedReloadTrigger: 0
};

export const ServidoresStore = signalStore(
  withState(initialState),

  withComputed((store) => ({
    // Método computado para filtro em Ativos
    queryParams: computed((): IServidorQueryParams => {
      const termo = store.searchTerm();
      const tipo = store.searchType();

      const statusId = store.selectedStatusId();
      const cargoId = store.selectedCargoId();
      const setorId = store.selectedSetorId();

      store.reloadTrigger();

      return {
        page: store.currentPage(),
        size: store.pageSize(),
        nome: tipo === 'NOME' && termo ? termo : undefined,
        cpf: tipo === 'CPF' && termo ? termo : undefined,
        matricula: tipo === 'MATRICULA' && termo ? termo : undefined,
        statusId: statusId ? statusId : undefined,
        cargoId: cargoId ? cargoId : undefined,
        setorId: setorId ? setorId : undefined
      };
    }),
    // Método computado para filtro em Desligados
    excludedQueryParams: computed((): IServidorExcludedQueryParams => {
      const term = store.excludedSearchTerm();
      store.excludedReloadTrigger();

      return {
        page: store.excludedCurrentPage(),
        size: store.excludedPageSize(),
        term: term ? term : undefined
      };
    })
  })),

  withMethods((
    store,
    servidorService = inject(ServidorService),
    dominioService = inject(DominioService),
    notificationService = inject(NotificationService),
    errorHandlerService = inject(ErrorHandlerService)
  ) => ({
    // Métodos que carregam dados das entidades de domínio
    loadStatus: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() => dominioService.getStatus().pipe(
          tapResponse({
            next: (response) => patchState(store, {
              status: response,
              isLoading: false
            }),
            error: (err) => {
              patchState(store, { isLoading: false, status: [] });
              errorHandlerService.handle(err, 'Buscar Status');
            }
          })
        ))
      )
    ),

    loadCargos: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() => dominioService.getCargos().pipe(
          tapResponse({
            next: (response) => patchState(store, {
              cargos: response,
              isLoading: false
            }),
            error: (err) => {
              patchState(store, { isLoading: false, cargos: [] });
              errorHandlerService.handle(err, 'Buscar Cargos');
            }
          })
        ))
      )
    ),

    loadSetores: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() => dominioService.getSetores().pipe(
          tapResponse({
            next: (response) => patchState(store, {
              setores: response,
              isLoading: false
            }),
            error: (err) => {
              patchState(store, { isLoading: false, setores: [] });
              errorHandlerService.handle(err, 'Buscar Setores');
            }
          })
        ))
      )
    ),

    loadVinculos: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() => dominioService.getVinculos().pipe(
          tapResponse({
            next: (response) => patchState(store, {
              vinculos: response,
              isLoading: false
            }),
            error: (err) => {
              patchState(store, { isLoading: false, vinculos: [] });
              errorHandlerService.handle(err, 'Buscar Vínculos');
            }
          })
        ))
      )
    ),

    loadLotacoes: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() => dominioService.getLotacaoList().pipe(
          tapResponse({
            next: (response) => patchState(store, {
              lotacoes: response,
              isLoading: false
            }),
            error: (err) => {
              patchState(store, { isLoading: false, lotacoes: [] });
              errorHandlerService.handle(err, 'Buscar Lotações');
            }
          })
        ))
      )
    ),

    loadSistemas: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() => dominioService.getSistemas().pipe(
          tapResponse({
            next: (response) => patchState(store, {
              sistemas: response,
              isLoading: false
            }),
            error: (err) => {
              patchState(store, { isLoading: false, sistemas: [] });
              errorHandlerService.handle(err, 'Buscar Sistemas');
            }
          })
        ))
      )
    ),

    loadProcuradores: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() => dominioService.getProcuradores().pipe(
          tapResponse({
            next: (response) => patchState(store, {
              procuradores: response,
              isLoading: false
            }),
            error: (err) => {
              patchState(store, { isLoading: false, procuradores: [] });
              errorHandlerService.handle(err, 'Buscar Procuradores');
            }
          })
        ))
      )
    ),

    loadGeneros: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() => dominioService.getGeneros().pipe(
          tapResponse({
            next: (response) => patchState(store, {
              generos: response,
              isLoading: false
            }),
            error: (err) => {
              patchState(store, { isLoading: false, generos: [] });
              errorHandlerService.handle(err, 'Buscar Gêneros');
            }
          })
        ))
      )
    ),

    loadAliases: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() => dominioService.getAliases().pipe(
          tapResponse({
            next: (response) => patchState(store, {
              aliases: response,
              isLoading: false
            }),
            error: (err) => {
              patchState(store, { isLoading: false, aliases: [] });
              errorHandlerService.handle(err, 'Buscar Alias(E-mail)');
            }
          })
        ))
      )
    ),

    loadAtividades: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() => dominioService.getAtividades().pipe(
          tapResponse({
            next: (response) => patchState(store, {
              atividades: response,
              isLoading: false
            }),
            error: (err) => {
              patchState(store, { isLoading: false, atividades: [] });
              errorHandlerService.handle(err, 'Buscar Atividades');
            }
          })
        ))
      )
    ),

    // MÉTODOS DE GERENCIAMENTO DO STATE DOS DADOS DE ATIVOS
    // ========================================================
    saveServidor: rxMethod<{
      action: 'CREATE' | 'UPDATE' | 'REACTIVATE';
      servidorId?: number;
      payload: ServidorRequestDTO,
      onSuccess: (response: any, action: string) => void;
    }>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(({ action, servidorId, payload, onSuccess }) => {
          let request$;
          let msgAction;
          let msgTitle;

          // 1. A Store decide a rota de API baseada na Action
          if (action === 'REACTIVATE') {
            request$ = servidorService.reactivate(servidorId!, payload);
            msgAction = 'readmitido';
            msgTitle = 'Readmissão';
          } else if (action === 'UPDATE') {
            request$ = servidorService.update(servidorId!, payload);
            msgAction = 'atualizado';
            msgTitle = 'Atualização';
          } else {
            request$ = servidorService.create(payload);
            msgAction = 'cadastrado';
            msgTitle = 'Cadastro';
          }

          return request$.pipe(
            tapResponse({
              next: (response) => {
                patchState(store, { isLoading: false });
                // Mensagem dinâmica de acordo com a ação
                const extraMsg = action === 'CREATE'
                  ? '<br>Você já pode gerenciar as permissões e anexar documentos.'
                  : '';

                notificationService.success(
                  `Servidor <strong>${payload.nome}</strong> ${msgAction} com sucesso! ${extraMsg}`,
                  msgTitle,
                  { duration: action === 'CREATE' ? 5000 : 3000 }
                );

                // Avisa o componente visual que deu certo e devolve os dados
                onSuccess(response, action);
              },
              error: (err) => {
                patchState(store, { isLoading: false });
                errorHandlerService.handle(err, msgTitle);
              }
            })
          );
        })
      )
    ),

    // Carrega os servidores
    loadServidores: rxMethod<IServidorQueryParams>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((params) => servidorService.searchFilter(params).pipe(
          tapResponse({
            next: (response) => patchState(store, {
              servidores: response.content,
              totalElements: response.page.totalElements ?? 0,
              isLoading: false
            }),
            error: (err) => {
              patchState(store, { isLoading: false });
              errorHandlerService.handle(err, 'Buscar Servidores');
            }
          })
        ))
      )
    ),

    // Atualiza os parâmetros do filtro quando uma opção é selecionada no combo
    updateDropdownFilter(
      filterParams: {
        selectedStatusId?: number | null,
        selectedCargoId?: number | null,
        selectedSetorId?: number | null
      }) {
      // O usuário filtrou algo novo, então sempre voltamos para a página 0
      patchState(store, { ...filterParams, currentPage: 0 });
    },

    // Atualiza os filtros dos Ativos e volta para a primeira página
    updateSearchType(type: 'NOME' | 'CPF' | 'MATRICULA') {
      patchState(store, { searchType: type, searchTerm: '', currentPage: 0 });
    },

    // Método reativo (Funil RxJS) para a digitação para os Ativos
    updateSearchTermDebounced: rxMethod<string>(
      pipe(
        debounceTime(500),
        distinctUntilChanged(),
        tap((termoDigitado) => {
          const termoLimpo = termoDigitado.trim();

          // Regra de Negócio preservada: Só busca se for vazio ou tiver >= 3 caracteres
          if (termoLimpo === '' || termoLimpo.length >= 3) {
            patchState(store, { searchTerm: termoLimpo, currentPage: 0 });
          }
        })
      )
    ),

    // Atualiza a paginação dos Ativos
    updatePagination(page: number, size: number) {
      patchState(store, { currentPage: page, pageSize: size });
    },

    updateLocalServidor(updatedServidor: ServidorResponseDTO) {
      patchState(store, (state) => ({
          servidores: state.servidores.map((servidor) =>
            servidor.id === updatedServidor.id ? updatedServidor : servidor)
        })
      );
    },

    // Força o recarregamento da lista dos Ativos
    reloadList() {
      patchState(store, { reloadTrigger: store.reloadTrigger() + 1 });
    },

    // MÉTODOS DE GERENCIAMENTO DO STATE DOS DADOS DE DESLIGADOS
    // ========================================================
    loadExcludedServidores: rxMethod<IServidorExcludedQueryParams>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((params) => servidorService.searchExcluded(params)
          .pipe(
            tapResponse({
              next: (response) => patchState(store, {
                excludedServidores: response.content,
                excludedTotalElements: response.page.totalElements ?? 0,
                isLoading: false
              }),
              error: (err) => {
                patchState(store, { isLoading: true });
                errorHandlerService.handle(err, 'Buscar Servidores');
              }
            })
          )
        )
      )
    ),

    // Atualiza os filtros dos Desligados e volta para a primeira página
    updateExcludedSearchType(type: 'NOME' | 'CPF') {
      patchState(store, { excludedSearchType: type, excludedSearchTerm: '', excludedCurrentPage: 0 });
    },

    // Método reativo (Funil RxJS) para a digitação para os Desligados
    updateExcludedSearchTermDebounced: rxMethod<string>(
      pipe(
        debounceTime(500),
        distinctUntilChanged(),
        tap((termoDigitado) => {
          const termoLimpo = termoDigitado.trim();
          if (termoLimpo === '' || termoLimpo.length >= 3) {
            patchState(store, { excludedSearchTerm: termoLimpo, excludedCurrentPage: 0 });
          }
        })
      )
    ),

    // Atualiza a paginação dos Desligados
    updateExcludedPagination(page: number, size: number) {
      patchState(store, { excludedCurrentPage: page, excludedPageSize: size });
    },

    // Força o recarregamento da lista dos Desligados
    reloadExcludeList() {
      patchState(store, { excludedReloadTrigger: store.excludedReloadTrigger() + 1 });
    },

    // Força o carregamento das duas listas (Ativos e Desligados)
    reloadBothList() {
      patchState(store, {
        reloadTrigger: store.reloadTrigger() + 1,
        excludedReloadTrigger: store.excludedReloadTrigger() + 1
      });
    },

    // Limpa os filtros de pesquisa dos Ativos
    clearAllFilters() {
      patchState(store, {
        selectedStatusId: null,
        selectedCargoId: null,
        selectedSetorId: null,
        searchTerm: '',
        searchType: 'NOME',
        currentPage: 0
      });
    },

    // Exclui (soft delete) registros dos Ativos
    deleteServidor: rxMethod<{ payload: TServidorDelete, onSuccess: () => void }>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(({ payload, onSuccess }) => servidorService.delete(payload)
          .pipe(
            tapResponse({
              next: () => {
                patchState(store, { isLoading: false });
                onSuccess();
              },
              error: (err) => {
                patchState(store, { isLoading: false });
                errorHandlerService.handle(err, 'Excluir');
              }
            })
          )
        )
      )
    )
  })),
  withHooks({
    onInit(store) {
      store.loadServidores(store.queryParams);
      store.loadExcludedServidores(store.excludedQueryParams);
      store.loadStatus();
      store.loadCargos();
      store.loadSetores();
      store.loadVinculos();
      store.loadSistemas();
      store.loadLotacoes();
      store.loadAliases();
      store.loadProcuradores();
      store.loadGeneros();
      store.loadAtividades();
    }
  })
);
