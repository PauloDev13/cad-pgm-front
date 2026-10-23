import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import {
  AndarCodigo,
  EstadoChamado
} from '../models/manutencao-enums.model';
import {
  AndarResponseDTO,
  CategoriaDemandaResponseDTO,
  SalaResponseDTO,
  TipoServicoResponseDTO
} from '../models/manutencao-catalogo.model';
import {
  AberturaChamadoRequestDTO,
  AtribuicaoChamadoRequestDTO,
  CancelarChamadoRequestDTO,
  ChamadoDetalheResponseDTO,
  ChamadoFilaQueryParams,
  ChamadoResumoResponseDTO,
  ConcluirChamadoRequestDTO,
  IniciarAtendimentoRequestDTO
} from '../models/manutencao-chamado.model';
import { ManutencaoChamadoService } from '../services/manutencao-chamado.service';
import { ManutencaoCatalogoService } from '../services/manutencao-catalogo.service';
import { ManutencaoLocalizacaoService } from '../services/manutencao-localizacao.service';
import { NotificationService } from '../../../shared/service/NotificationSnackbar.service';
import { ErrorHandlerService } from '../../../shared/service/error-handler.service';

type ManutencaoState = {
  isLoading: boolean;
  chamados: ChamadoResumoResponseDTO[];
  totalElements: number;
  chamadoDetalhe: ChamadoDetalheResponseDTO | null;

  // Filtros da Fila
  filtroEstado: EstadoChamado | null;
  filtroCategoriaId: number | null;
  filtroTipoServicoId: number | null;
  filtroAndar: AndarCodigo | null;
  filtroSalaId: number | null;
  currentPage: number;
  pageSize: number;

  // Catálogos e Apoio em Memória
  andares: AndarResponseDTO[];
  salasPorAndar: SalaResponseDTO[];
  categorias: CategoriaDemandaResponseDTO[];
  tiposPorCategoria: TipoServicoResponseDTO[];

  reloadTrigger: number;
};

const initialState: ManutencaoState = {
  isLoading: false,
  chamados: [],
  totalElements: 0,
  chamadoDetalhe: null,
  filtroEstado: null,
  filtroCategoriaId: null,
  filtroTipoServicoId: null,
  filtroAndar: null,
  filtroSalaId: null,
  currentPage: 0,
  pageSize: 10,
  andares: [],
  salasPorAndar: [],
  categorias: [],
  tiposPorCategoria: [],
  reloadTrigger: 0
};

export const ManutencaoStore = signalStore(
  withState(initialState),

  withComputed((store) => ({
    queryParams: computed((): ChamadoFilaQueryParams => {
      store.reloadTrigger();
      return {
        page: store.currentPage(),
        size: store.pageSize(),
        estado: store.filtroEstado() ?? undefined,
        categoriaId: store.filtroCategoriaId() ?? undefined,
        tipoServicoId: store.filtroTipoServicoId() ?? undefined,
        andar: store.filtroAndar() ?? undefined,
        salaId: store.filtroSalaId() ?? undefined
      };
    })
  })),

  withMethods((
    store,
    chamadoService = inject(ManutencaoChamadoService),
    catalogoService = inject(ManutencaoCatalogoService),
    localizacaoService = inject(ManutencaoLocalizacaoService),
    notificationService = inject(NotificationService),
    errorHandler = inject(ErrorHandlerService)
  ) => ({
    updatePagination(page: number, size: number) {
      patchState(store, { currentPage: page, pageSize: size });
    },

    updateFiltros(filtros: Partial<ManutencaoState>) {
      patchState(store, { ...filtros, currentPage: 0 });
    },

    clearFiltros() {
      patchState(store, {
        filtroEstado: null,
        filtroCategoriaId: null,
        filtroTipoServicoId: null,
        filtroAndar: null,
        filtroSalaId: null,
        currentPage: 0
      });
    },

    reloadList() {
      patchState(store, { reloadTrigger: store.reloadTrigger() + 1 });
    },

    // Carregar Fila Geral (Almoxarifado)
    loadFilaGeral: rxMethod<ChamadoFilaQueryParams>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((params) =>
          chamadoService.listarFilaGeral(params).pipe(
            tapResponse({
              next: (res) => patchState(store, {
                chamados: res.content,
                totalElements: res.page?.totalElements ?? 0,
                isLoading: false
              }),
              error: (err) => {
                patchState(store, { isLoading: false, chamados: [] });
                errorHandler.handle(err, 'Fila de Chamados');
              }
            })
          )
        )
      )
    ),

    // Carregar Meus Chamados (Solicitante)
    loadMeusChamados: rxMethod<{ page: number; size: number }>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(({ page, size }) =>
          chamadoService.listarMeusChamados(page, size).pipe(
            tapResponse({
              next: (res) => patchState(store, {
                chamados: res.content,
                totalElements: res.page?.totalElements ?? 0,
                isLoading: false
              }),
              error: (err) => {
                patchState(store, { isLoading: false, chamados: [] });
                errorHandler.handle(err, 'Meus Chamados');
              }
            })
          )
        )
      )
    ),

    // Detalhes do Chamado
    loadDetalhes: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((id) =>
          chamadoService.buscarDetalhes(id).pipe(
            tapResponse({
              next: (res) => patchState(store, { chamadoDetalhe: res, isLoading: false }),
              error: (err) => {
                patchState(store, { isLoading: false });
                errorHandler.handle(err, 'Detalhes do Chamado');
              }
            })
          )
        )
      )
    ),

    // Operações de Ciclo de Vida
    abrirChamado: rxMethod<{ payload: AberturaChamadoRequestDTO; onSuccess: () => void }>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(({ payload, onSuccess }) =>
          chamadoService.abrirChamado(payload).pipe(
            tapResponse({
              next: (criado) => {
                patchState(store, { isLoading: false });
                notificationService.success(`Chamado ${criado.protocolo} aberto com sucesso!`, 'Abertura de Chamado');
                onSuccess();
              },
              error: (err) => {
                patchState(store, { isLoading: false });
                errorHandler.handle(err, 'Abertura de Chamado');
              }
            })
          )
        )
      )
    ),

    atribuirResponsavel: rxMethod<{ id: number; payload: AtribuicaoChamadoRequestDTO; onSuccess: () => void }>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(({ id, payload, onSuccess }) =>
          chamadoService.atribuirResponsavel(id, payload).pipe(
            tapResponse({
              next: (atualizado) => {
                patchState(store, { chamadoDetalhe: atualizado, isLoading: false });
                notificationService.success('Responsável atribuído com sucesso!', 'Atribuição');
                onSuccess();
              },
              error: (err) => {
                patchState(store, { isLoading: false });
                errorHandler.handle(err, 'Atribuição');
              }
            })
          )
        )
      )
    ),

    iniciarAtendimento: rxMethod<{ id: number; payload?: IniciarAtendimentoRequestDTO; onSuccess: () => void }>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(({ id, payload, onSuccess }) =>
          chamadoService.iniciarAtendimento(id, payload).pipe(
            tapResponse({
              next: (atualizado) => {
                patchState(store, { chamadoDetalhe: atualizado, isLoading: false });
                notificationService.success('Atendimento iniciado!', 'Operação');
                onSuccess();
              },
              error: (err) => {
                patchState(store, { isLoading: false });
                errorHandler.handle(err, 'Iniciar Atendimento');
              }
            })
          )
        )
      )
    ),

    concluirAtendimento: rxMethod<{ id: number; payload?: ConcluirChamadoRequestDTO; onSuccess: () => void }>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(({ id, payload, onSuccess }) =>
          chamadoService.concluirAtendimento(id, payload).pipe(
            tapResponse({
              next: (atualizado) => {
                patchState(store, { chamadoDetalhe: atualizado, isLoading: false });
                notificationService.success('Chamado concluído com sucesso!', 'Conclusão');
                onSuccess();
              },
              error: (err) => {
                patchState(store, { isLoading: false });
                errorHandler.handle(err, 'Conclusão');
              }
            })
          )
        )
      )
    ),

    cancelarChamado: rxMethod<{ id: number; payload: CancelarChamadoRequestDTO; onSuccess: () => void }>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(({ id, payload, onSuccess }) =>
          chamadoService.cancelarChamado(id, payload).pipe(
            tapResponse({
              next: (atualizado) => {
                patchState(store, { chamadoDetalhe: atualizado, isLoading: false });
                notificationService.success('Chamado cancelado.', 'Cancelamento');
                onSuccess();
              },
              error: (err) => {
                patchState(store, { isLoading: false });
                errorHandler.handle(err, 'Cancelar Chamado');
              }
            })
          )
        )
      )
    ),

    // Carregamento de Metadados / Catálogos
    loadAndares: rxMethod<void>(
      pipe(
        switchMap(() => localizacaoService.listarAndares().pipe(
          tapResponse({
            next: (andares) => patchState(store, { andares }),
            error: (err) => errorHandler.handle(err, 'Andares')
          })
        ))
      )
    ),

    loadSalasPorAndar: rxMethod<AndarCodigo>(
      pipe(
        switchMap((andar) => localizacaoService.listarSalasPorAndar(andar).pipe(
          tapResponse({
            next: (salas) => patchState(store, { salasPorAndar: salas }),
            error: (err) => errorHandler.handle(err, 'Salas')
          })
        ))
      )
    ),

    loadCategorias: rxMethod<void>(
      pipe(
        switchMap(() => catalogoService.listarCategoriasAtivas().pipe(
          tapResponse({
            next: (categorias) => patchState(store, { categorias }),
            error: (err) => errorHandler.handle(err, 'Categorias')
          })
        ))
      )
    ),

    loadTiposPorCategoria: rxMethod<number>(
      pipe(
        switchMap((catId) => catalogoService.listarTiposPorCategoria(catId).pipe(
          tapResponse({
            next: (tipos) => patchState(store, { tiposPorCategoria: tipos }),
            error: (err) => errorHandler.handle(err, 'Tipos de Serviço')
          })
        ))
      )
    )
  }))
);
