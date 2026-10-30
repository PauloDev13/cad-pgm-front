import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import { AndarCodigo, EstadoChamado } from '../models/manutencao-enums.model';
import {
  AndarResponseDTO,
  CategoriaDemandaRequestDTO,
  CategoriaDemandaResponseDTO,
  SalaResponseDTO,
  TipoServicoRequestDTO,
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

  // =========================================================================
  // NOVO: ESTADO DE CONTROLE E PAGINAÇÃO DO CATÁLOGO DE SERVIÇOS
  // =========================================================================
  catalogoTabAtiva: number;              // 0 = Categorias, 1 = Tipos de Serviço
  catalogoPageIndex: number;             // Página atual do Paginator Único (base 0)
  catalogoPageSize: number;              // Tamanho da página (padrão 10)
  catalogoTotalElements: number;         // totalElements da guia ativa
  catalogoCategoriaSelecionadaId: number | null; // Categoria selecionada na Guia 2
  categoriasPaginadas: CategoriaDemandaResponseDTO[];
  tiposPorCategoriaPaginados: TipoServicoResponseDTO[];

  reloadTrigger: number;
};

const initialState: ManutencaoState = {
  isLoading: false,
  chamados: [],
  totalElements: 0,
  chamadoDetalhe: null,

  // Filtros da Fila
  filtroEstado: null,
  filtroCategoriaId: null,
  filtroTipoServicoId: null,
  filtroAndar: null,
  filtroSalaId: null,
  currentPage: 0,
  pageSize: 10,

  // Catálogos e Apoio em Memória
  andares: [],
  salasPorAndar: [],
  categorias: [],
  tiposPorCategoria: [],

  // Valores iniciais do Catálogo Paginado
  catalogoTabAtiva: 0,
  catalogoPageIndex: 0,
  catalogoPageSize: 10,
  catalogoTotalElements: 0,
  catalogoCategoriaSelecionadaId: null,
  categoriasPaginadas: [],
  tiposPorCategoriaPaginados: [],

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

  // =========================================================================
  // 1º BLOCO WITH METHODS: CONSULTAS, FILTROS E CARREGAMENTO DE METADADOS
  // =========================================================================
  withMethods((
    store,
    chamadoService = inject(ManutencaoChamadoService),
    catalogoService = inject(ManutencaoCatalogoService),
    localizacaoService = inject(ManutencaoLocalizacaoService),
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
    // Carregamento de Metadados / Catálogos
    loadAndares: rxMethod<void>(
      pipe(
        switchMap(() =>
          localizacaoService.listarAndares().pipe(
            tapResponse({
              next: (andares) => patchState(store, { andares }),
              error: (err) => errorHandler.handle(err, 'Andares')
            })
          )
        )
      )
    ),
    loadSalasPorAndar: rxMethod<AndarCodigo>(
      pipe(
        switchMap((andar) =>
          localizacaoService.listarSalasPorAndar(andar).pipe(
            tapResponse({
              next: (salas) => patchState(store, { salasPorAndar: salas }),
              error: (err) => errorHandler.handle(err, 'Salas')
            })
          )
        )
      )
    ),

    //=========================================================
    // DECLARAÇÕES DOS RX METHODS DE BUSCA PAGINADA DO CATÁLOGO
    // ========================================================

    // RETORNA TODAS AS CATEGORIAS PAGINADAS
    loadCategoriasPaginadas: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() =>
          catalogoService.listarCategoriasPaginadas(store.catalogoPageIndex(), store.catalogoPageSize()).pipe(
            tapResponse({
              next: (res) => patchState(store, {
                categoriasPaginadas: res.content,
                catalogoTotalElements: res.page?.totalElements,
                isLoading: false
              }),
              error: (err) => {
                patchState(store, { isLoading: false, categoriasPaginadas: [], catalogoTotalElements: 0 });
                errorHandler.handle(err, 'Categorias Paginadas');
              }
            })
          )
        )
      )
    ),

    // RETORNA AS CATEGORIAS ATIVAS SEM PAGINAÇÃO
    loadCategoriasAtivas: rxMethod<void>(
      pipe(
        switchMap(() =>
          catalogoService.listarCategoriasAtivas().pipe(
            tapResponse({
              next: (categorias) => patchState(store, { categorias }),
              error: (err) => errorHandler.handle(err, 'Categorias')
            })
          )
        )
      )
    ),

    // RETORNA TODOS OS TIPOS DE SERVIÇOS POR CATEGORIAS PAGINADAS
    loadTiposPorCategoriaPaginados: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() => {
          const catId = store.catalogoCategoriaSelecionadaId();
          if (!catId) {
            patchState(store, { tiposPorCategoriaPaginados: [], catalogoTotalElements: 0, isLoading: false });
            return [];
          }
          return catalogoService.listarTiposPorCategoriaPaginados(
            catId, store.catalogoPageIndex(), store.catalogoPageSize()).pipe(
            tapResponse({
              next: (res) => patchState(store, {
                tiposPorCategoriaPaginados: res.content,
                catalogoTotalElements: res.page?.totalElements,
                isLoading: false
              }),
              error: (err) => {
                patchState(store, { isLoading: false, tiposPorCategoriaPaginados: [], catalogoTotalElements: 0 });
                errorHandler.handle(err, 'Tipos de Serviço Paginados');
              }
            })
          );
        })
      )
    ),
    // RETORNA OS TIPOS DE SERVIÇO ATIVOS POR CATEGORIAS SEM PAGINAÇÃO
    loadTiposAtivosPorCategoria: rxMethod<number>(
      pipe(
        switchMap((catId) =>
          catalogoService.listarTiposAtivosPorCategoria(catId).pipe(
            tapResponse({
              next: (tipos) => patchState(store, { tiposPorCategoria: tipos }),
              error: (err) => errorHandler.handle(err, 'Tipos de Serviço')
            })
          )
        )
      )
    )
  })),
  // =========================================================================
  // 2º BLOCO WITH METHODS: MUTAÇÕES E AÇÕES (Enxerga todos os métodos do 1º bloco)
  // =========================================================================
  withMethods((
    store,
    chamadoService = inject(ManutencaoChamadoService),
    catalogoService = inject(ManutencaoCatalogoService),
    notificationService = inject(NotificationService),
    errorHandler = inject(ErrorHandlerService)
  ) => ({

    /**
     * Inicializa os dados do catálogo (carrega combo e primeira página de categorias)
     */
    initCatalogo() {
      catalogoService.listarCategoriasAtivas().subscribe({
        next: (cats) => {
          patchState(store, {
            categorias: cats,
            catalogoCategoriaSelecionadaId: cats.length > 0 ? cats[0].id : null
          });
          store.loadCategoriasPaginadas();
        }
      });
    },

    /**
     * REGRA DE NEGÓCIO: Alternar guia reseta pageIndex para 0 e busca dados da nova guia
     */
    setCatalogoTab(tabIndex: number) {
      patchState(store, {
        catalogoTabAtiva: tabIndex,
        catalogoPageIndex: 0 // Reset obrigatório
      });

      if (tabIndex === 0) {
        store.loadCategoriasPaginadas();
      } else {
        store.loadTiposPorCategoriaPaginados();
      }
    },

    /**
     * REGRA DE NEGÓCIO: Trocar categoria na Guia 2 reseta pageIndex para 0 e busca tipos
     */
    setCatalogoCategoriaSelecionada(categoriaId: number) {
      patchState(store, {
        catalogoCategoriaSelecionadaId: categoriaId,
        catalogoPageIndex: 0 // Reset obrigatório
      });
      store.loadTiposPorCategoriaPaginados();
    },

    /**
     * REGRA DE NEGÓCIO: Evento do Paginator Único atualiza a página/tamanho e busca na guia ativa
     */
    changeCatalogoPagination(pageIndex: number, pageSize: number) {
      patchState(store, {
        catalogoPageIndex: pageIndex,
        catalogoPageSize: pageSize
      });

      if (store.catalogoTabAtiva() === 0) {
        store.loadCategoriasPaginadas();
      } else {
        store.loadTiposPorCategoriaPaginados();
      }
    },
    // Ações de Ciclo de Vida de Chamados
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

    // ==========================================
    // MUTAÇÕES DO CATÁLOGO (ADMIN)
    // ==========================================
    salvarCategoria: rxMethod<{
      isEdit: boolean;
      id?: number;
      payload: CategoriaDemandaRequestDTO;
      onSuccess: () => void;
    }>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(({ isEdit, id, payload, onSuccess }) => {
          const action$ = isEdit
            ? catalogoService.atualizarCategoria(id!, payload)
            : catalogoService.criarCategoria(payload);
          const acaoNome = isEdit ? 'Atualização de Categoria' : 'Cadastro de Categoria';
          return action$.pipe(
            tapResponse({
              next: () => {
                patchState(store, { isLoading: false });
                notificationService.success(
                  `Categoria ${isEdit ? 'atualizada' : 'cadastrada'} com sucesso!`,
                  acaoNome
                );
                store.loadCategoriasPaginadas();
                onSuccess();
              },
              error: (err) => {
                patchState(store, { isLoading: false });
                errorHandler.handle(err, acaoNome);
              }
            })
          );
        })
      )
    ),
    salvarTipoServico: rxMethod<{
      isEdit: boolean;
      id?: number;
      categoriaId: number;
      payload: TipoServicoRequestDTO;
      onSuccess: () => void;
    }>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(({ isEdit, id, categoriaId, payload, onSuccess }) => {
          const action$ = isEdit
            ? catalogoService.atualizarTipoServico(id!, payload)
            : catalogoService.criarTipoServico(payload);
          const acaoNome = isEdit ? 'Atualização de Serviço' : 'Cadastro de Serviço';
          return action$.pipe(
            tapResponse({
              next: () => {
                patchState(store, { isLoading: false });
                notificationService.success(
                  `Tipo de serviço ${isEdit ? 'atualizado' : 'cadastrado'} com sucesso!`,
                  acaoNome
                );
                store.loadTiposPorCategoriaPaginados();
                onSuccess();
              },
              error: (err) => {
                patchState(store, { isLoading: false });
                errorHandler.handle(err, acaoNome);
              }
            })
          );
        })
      )
    ),
    alterarStatusTipoServico: rxMethod<{
      id: number;
      categoriaId: number;
      ativo: boolean;
    }>(
      pipe(
        switchMap(({ id, categoriaId, ativo }) =>
          catalogoService.alterarStatusTipoServico(id, ativo).pipe(
            tapResponse({
              next: () => {
                notificationService.success('Status do serviço atualizado!', 'Catálogo');
                store.loadTiposAtivosPorCategoria(categoriaId);
              },
              error: (err) => {
                errorHandler.handle(err, 'Alteração de Status');
                store.loadTiposAtivosPorCategoria(categoriaId);
              }
            })
          )
        )
      )
    )
  }))
);
