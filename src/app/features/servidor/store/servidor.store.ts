import {
  IServidorExcludedQueryParams,
  IServidorQueryParams,
  ServidorRequestDTO,
  ServidorResponseDTO,
  TServidorDelete
} from '../models/servidor.model';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { computed, DestroyRef, effect, inject, NgZone } from '@angular/core';
import { ServidorService } from '../services/servidor.service';
import { NotificationService } from '../../../shared/service/NotificationSnackbar.service';
import { ErrorHandlerService } from '../../../shared/service/error-handler.service';
import { DominioService } from '../services/dominio.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { debounceTime, distinctUntilChanged, pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { fetchEventSource } from '@microsoft/fetch-event-source';


type ServidorState = {
  // State da seleção feita nos combos
  selectedStatusId: number | null;
  selectedCargoId: number | null;
  selectedSetorId: number | null;

  // State do spinner
  isLoading: boolean;

  // Estado da listagem
  servidores: ServidorResponseDTO[];

  // Estado do número de registro cujo status está como pendente
  totalPendentes: number;

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
  totalPendentes: 0,

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
  { providedIn: 'root' },
  withState(initialState),

  withComputed((store, dominioService = inject(DominioService)) => ({
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
    }),

    // Métodos computado que carregam dados das entidades de domínio
    setores: computed(() => dominioService.setoresResource.value() ?? []),
    status: computed(() => dominioService.statusResource.value() ?? []),
    cargos: computed(() => dominioService.cargosResource.value() ?? []),
    vinculos: computed(() => dominioService.vinculosResource.value() ?? []),
    lotacoes: computed(() => dominioService.lotacoesResource.value() ?? []),
    sistemas: computed(() => dominioService.sistemasResource.value() ?? []),
    procuradores: computed(() => dominioService.procuradoresResource.value() ?? []),
    generos: computed(() => dominioService.generosResource.value() ?? []),
    aliases: computed(() => dominioService.aliasesResource.value() ?? []),
    atividades: computed(() => dominioService.atividadesResource.value() ?? [])
  })),

  withMethods((
    store,
    servidorService = inject(ServidorService),
    errorHandlerService = inject(ErrorHandlerService)) => ({

    loadTotalPendentes: rxMethod<void>(
      pipe(
        switchMap(() => servidorService.searchFilter({
          statusId: 4, page: 0, size: 1
        }).pipe(
          tapResponse({
            next: (response) => patchState(store, {
              totalPendentes: response.page.totalElements ?? 0
            }),
            error: (err) => errorHandlerService.handle(err, 'Erro ao buscar registros pendentes')
          })
        ))
      )
    )
  })),

  withMethods((
    store,
    servidorService = inject(ServidorService),
    notificationService = inject(NotificationService),
    errorHandlerService = inject(ErrorHandlerService),
    router = inject(Router)
  ) => ({
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
                patchState(store, {
                  isLoading: false,
                  reloadTrigger: store.reloadTrigger() + 1
                });

                // Atualiza o número de registro com Status como "pendente"
                // store.loadTotalPendentes();

                // Mensagem dinâmica conforme a ação
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

      // Limpa a URL apagando o parâmetro fantasma
      router.navigate([], {
        queryParams: { statusId: null }, // Passar null remove o parâmetro da URL
        queryParamsHandling: 'merge' // Garante que não vai quebrar a rota atual
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
              error: (err: HttpErrorResponse) => {
                patchState(store, { isLoading: false });
                // errorHandlerService.handle(err, 'Excluir');
                notificationService.error(err.message, 'Desligar Servidor', {
                  duration: 5000
                });
              }
            })
          )
        )
      )
    )
  })),
  withHooks({
    onInit(store) {
      // Injeções necessárias para lidar com eventos externos e limpeza
      const destroyRef = inject(DestroyRef);
      const zone = inject(NgZone);
      const token = localStorage.getItem('jwt-token');

      // Cargas iniciais
      store.loadServidores(store.queryParams);
      store.loadExcludedServidores(store.excludedQueryParams);
      store.loadTotalPendentes();

      /* ==============================================
          IMPLEMENTAÇÃO PARA OUVIR NOTIFICAÇÕES DO
          BACKEND QUANDO O STATUS MUDAR PARA 'PENDENTE'
      ============================================== */

      const sseUrl = `${environment.apiUrl}/api/notifications/stream`;

      // O controlador que permite abortar a requisição quando o usuário sair
      const ctrl = new AbortController();

      // Conectando na "rádio" do backend COM segurança (Headers)
      fetchEventSource(sseUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/event-stream'
        },
        signal: ctrl.signal,

        // Quando receber uma mensagem do backend
        onmessage(event) {
          if (event.event === 'pendentes-update') {
            zone.run(() => {
              // Dispara a mini-requisição para atualizar o total e refletir na tela!
              store.loadTotalPendentes();
            });
          }
        },
        // Tratamento de erros e reconexão automática
        onerror(err) {
          console.warn('Conexão SSE oscilou. O navegador tentará reconectar...', err);
          return 5000;
        }
      });

      // Prevenção de Memory Leak: Desliga o "rádio" e aborta o fetch
      destroyRef.onDestroy(() => {
        ctrl.abort();
      });

      /* =====================
         FIM DA IMPLEMENTAÇÃO
      // ===================== */

      // O effect age como um observador silencioso monitorando o total de pendentes
      effect(() => {
        const total = store.totalPendentes();
        const currentStatus = store.selectedStatusId();

        // Se a contagem bater zero e o usuário estiver na tela de pendentes (status = 4)
        if (total === 0 && currentStatus === 4) {

          // Chama o clearAllFilters
          store.clearAllFilters();

          // O clearAllFilters limpa tudo, e como a Store é reativa,
          // a tabela vai recarregar automaticamente mostrando todos os servidores!
        }
      });
    }
  })
);
