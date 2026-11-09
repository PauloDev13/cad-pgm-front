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
  SubcategoriaFiltroParams,
  SubcategoriaRequestDTO,
  SubcategoriaResponseDTO,
  TipoServicoFiltroParams,
  TipoServicoRequestDTO,
  TipoServicoResponseDTO
} from '../models/manutencao-catalogo.model';
import {
  AberturaChamadoRequestDTO,
  AtribuicaoChamadoRequestDTO,
  AtualizarDadosAdministrativosRequestDTO,
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
  // Controle geral
  isLoading: boolean;
  chamados: ChamadoResumoResponseDTO[];
  totalElements: number;
  chamadoDetalhe: ChamadoDetalheResponseDTO | null;

  // Filtros da Fila de Chamados
  filtroEstado: EstadoChamado | null;
  filtroCategoriaId: number | null;
  filtroTipoServicoId: number | null;
  filtroAndar: AndarCodigo | null;
  filtroSalaId: number | null;
  currentPage: number;
  pageSize: number;

  // Apoio em Memória para Chamados
  andares: AndarResponseDTO[];
  salasPorAndar: SalaResponseDTO[];
  categorias: CategoriaDemandaResponseDTO[];
  tiposPorCategoria: TipoServicoResponseDTO[];

  // =========================================================================
  // CATÁLOGO DE SERVIÇOS: CONTROLE, PAGINAÇÃO E FILTROS DINÂMICOS
  // =========================================================================
  catalogoTabAtiva: number;              // 0 = Categorias, 1 = Subcategorias, 2 = Tipos de Serviço
  catalogoPageIndex: number;             // Página atual do Paginator Único (base 0)
  catalogoPageSize: number;              // Tamanho da página (padrão 10)
  catalogoTotalElements: number;         // totalElements da guia ativa

  // Filtros aplicados nos dropdowns
  filtroSubcategoriaCategoriaId: number | null;     // Categoria selecionada na Aba 2
  filtroTipoServicoSubcategoriaId: number | null;   // Subcategoria selecionada na Aba 3

  // Caches únicos para popular selects (prevenção de chamadas repetitivas)
  categoriasAtivasDropdown: CategoriaDemandaResponseDTO[];
  subcategoriasAtivasDropdown: SubcategoriaResponseDTO[];

  // catalogoSubCategoriaSelecionadaId: number | null; // Categoria selecionada na Guia 2

  // Listagens paginadas das tabelas do Catálogo
  categoriasPaginadas: CategoriaDemandaResponseDTO[];
  subcategoriasPaginadas: SubcategoriaResponseDTO[];
  tiposServicoPaginados: TipoServicoResponseDTO[];

  // tiposPorSubCategoriaPaginados: TipoServicoResponseDTO[];
  // catalogoCategoriaSelecionadaId: number | null;    // Filtro da Aba 1 (Subcategorias)
  // catalogoSubcategoriaSelecionadaId: number | null; // Filtro da Aba 2 (Tipos de Serviço)

  subcategoriasAtivas: SubcategoriaResponseDTO[];

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

  filtroSubcategoriaCategoriaId: null,
  filtroTipoServicoSubcategoriaId: null,

  categoriasAtivasDropdown: [],
  subcategoriasAtivasDropdown: [],
  // catalogoSubCategoriaSelecionadaId: null,
  categoriasPaginadas: [],
  subcategoriasPaginadas: [],
  tiposServicoPaginados: [],

  subcategoriasAtivas: [],
  // tiposPorSubCategoriaPaginados: [],
  // catalogoCategoriaSelecionadaId: null,
  // catalogoSubcategoriaSelecionadaId: null,

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

    // CARGA DAS "CATEGORIAS" (ATIVAS/INATIVAS) PAGINADAS
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

    // CARGA DAS "SUBCATEGORIAS" (ATIVAS/INATIVAS) PAGINADAS
    loadSubcategoriasPaginadas: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() => {
          const catId = store.filtroSubcategoriaCategoriaId();
          const page = store.catalogoPageIndex();
          const size = store.catalogoPageSize();

          // Regra:
          // Se catId preenchido: filtra ativas da categoria { categoriaId: catId, ativo: true, page, size }
          // Se catId null: lista todas (ativas e inativas) { page, size }
          const params: SubcategoriaFiltroParams = catId
            ? { categoriaId: catId, ativo: true, page, size }
            : { page, size };

          return catalogoService.listarSubcategoriasPaginadas(
            params).pipe(
            tapResponse({
              next: (res) => patchState(store, {
                subcategoriasPaginadas: res.content ?? [],
                catalogoTotalElements: res.page?.totalElements ?? res.totalElements ?? 0,
                isLoading: false
              }),
              error: (err) => {
                patchState(store, {
                  isLoading: false,
                  subcategoriasPaginadas: [],
                  catalogoTotalElements: 0
                });
                errorHandler.handle(err, 'Subcategorias Paginadas');
              }
            })
          );
        })
      )
    ),


    // CARGA DOS "TIPOS DE SERVIÇOS" (ATIVOS/INATIVOS) PAGINADOS
    loadTiposServicoPaginados: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() => {
          const subCatId = store.filtroTipoServicoSubcategoriaId();
          const page = store.catalogoPageIndex();
          const size = store.catalogoPageSize();

          // Regra:
          // Se subCatId preenchido: filtra ativos da subcategoria { subcategoriaId: subCatId, ativo: true, page, size }
          // Se subCatId null: lista todos (ativos e inativos) { page, size }
          const params: TipoServicoFiltroParams = subCatId
            ? { subcategoriaId: subCatId, ativo: null, page, size }
            : { page, size };

          return catalogoService.listarTiposServicoPaginados(
            params).pipe(
            tapResponse({
              next: (res) => patchState(store, {
                tiposServicoPaginados: res.content ?? [],
                catalogoTotalElements: res.page?.totalElements ?? res.totalElements ?? 0,
                isLoading: false
              }),
              error: (err) => {
                patchState(store, {
                  isLoading: false,
                  tiposServicoPaginados: [],
                  catalogoTotalElements: 0
                });
                errorHandler.handle(err, 'Tipos de Serviço Paginados');
              }
            })
          );
        })
      )
    ),

    // CARGA DAS "CATEGORIAS" ATIVAS PARA O DROPDOWN CATEGORIAS
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

    // CARGA DAS "SUBCATEGORIAS" ATIVAS PARA O DROPDOWN SUBCATEGORIAS
    loadSubcategoriasAtivasPorCategoria: rxMethod<number>(
      pipe(
        switchMap((catId) =>
          catalogoService.listarSubcategoriasAtivasPorCategoria(catId).pipe(
            tapResponse({
              next: (subs) => patchState(
                store, { subcategoriasAtivas: subs }
              ),
              error: (err) => errorHandler.handle(err, 'Subcategorias Ativas')
            })
          )
        )
      )
    ),

    // CARGA DOS "TIPOS DE SERVIÇOS" ATIVOS PARA O DROPDOWN TIPO DE SERVIÇO
    loadTiposAtivosPorSubCategoria: rxMethod<number>(
      pipe(
        switchMap((catId) =>
          catalogoService.listarTiposAtivosPorSubCategoria(catId).pipe(
            tapResponse({
              next: (tipos) => patchState(store, { tiposPorCategoria: tipos }),
              error: (err) => errorHandler.handle(err, 'Tipos de Serviço')
            })
          )
        )
      )
    ),

    // GARANTIR CARGA DE CATEGORIAS ATIVAS PARA DROPDOWN (SEM REQUISIÇÃO REDUNDANTE)
    ensureCategoriasAtivasDropdown: rxMethod<void>(
      pipe(
        switchMap(() => {
          // Se o cache já estiver preenchido, não dispara nova requisição HTTP
          if (store.categoriasAtivasDropdown().length > 0) {
            return [];
          }
          return catalogoService.listarCategoriasAtivas().pipe(
            tapResponse({
              next: (categorias) => patchState(store, {
                categoriasAtivasDropdown: categorias,
                // Sincroniza também a lista legado 'categorias' caso usada na abertura de chamado
                categorias: categorias
              }),
              error: (err) => errorHandler.handle(err, 'Dropdown de Categorias')
            })
          );
        })
      )
    ),

    // GARANTIR CARGA DE SUBCATEGORIAS ATIVAS PARA DROPDOWN (SEM REQUISIÇÃO REDUNDANTE)
    ensureSubcategoriasAtivasDropdown: rxMethod<void>(
      pipe(
        switchMap(() => {
          if (store.subcategoriasAtivasDropdown().length > 0) {
            return [];
          }
          return catalogoService.listarSubcategoriasAtivas().pipe(
            tapResponse({
              next: (subs) => patchState(store, {
                subcategoriasAtivasDropdown: subs
              }),
              error: (err) => errorHandler.handle(err, 'Dropdown de Subcategorias')
            })
          );
        })
      )
    ),

    // Invalidação de Cache nos métodos de mutação (salvar/atualizar status)
    // para que qualquer criação/edição reflita nos dropdowns:
    invalidarCachesDropdowns() {
      patchState(store, {
        categoriasAtivasDropdown: [],
        subcategoriasAtivasDropdown: []
      });
    }
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
     * Inicializa o Catálogo de Serviços
     */
    initCatalogo() {
      store.ensureCategoriasAtivasDropdown();
      store.ensureSubcategoriasAtivasDropdown();
      store.loadCategoriasPaginadas();
    },

    /**
     * Handler disparado pelo dropdown de Categorias na Aba de Subcategorias
     * Atualiza o signal de filtro, reseta a paginação e dispara a busca paginada
     */
    onCategoriaFilterChange(categoriaId: number | null) {
      patchState(store, {
        filtroSubcategoriaCategoriaId: categoriaId,
        catalogoPageIndex: 0 // Reset obrigatório ao alterar filtro
      });
      store.loadSubcategoriasPaginadas();
    },

    /**
     * Handler disparado pelo dropdown de Subcategorias na Aba de Tipos de Serviço
     * Atualiza o signal de filtro, reseta a paginação e dispara a busca paginada
     */
    onSubcategoriaFilterChange(subcategoriaId: number | null) {
      patchState(store, {
        filtroTipoServicoSubcategoriaId: subcategoriaId,
        catalogoPageIndex: 0 // Reset obrigatório ao alterar filtro
      });
      store.loadTiposServicoPaginados();
    },

    /**
     * Limpa o filtro da Aba Subcategorias e recarrega listagem completa
     */
    resetFiltroSubcategoria() {
      patchState(store, {
        filtroSubcategoriaCategoriaId: null,
        catalogoPageIndex: 0
      });
      store.loadSubcategoriasPaginadas();
    },

    /**
     * Limpa o filtro da Aba Tipos de Serviço e recarrega listagem completa
     */
    resetFiltroTipoServico() {
      patchState(store, {
        filtroTipoServicoSubcategoriaId: null,
        catalogoPageIndex: 0
      });
      store.loadTiposServicoPaginados();
    },

    /**
     * Alternância de Abas: Reseta o índice de página e carrega os dados da aba correspondente
     */
    setCatalogoTab(tabIndex: number) {
      patchState(store, {
        catalogoTabAtiva: tabIndex,
        catalogoPageIndex: 0 // Reset obrigatório
      });

      if (tabIndex === 0) {
        store.loadCategoriasPaginadas();
      } else if (tabIndex === 1) {
        store.ensureCategoriasAtivasDropdown();
        store.loadSubcategoriasPaginadas();
      } else if (tabIndex === 2) {
        store.ensureSubcategoriasAtivasDropdown();
        store.loadTiposServicoPaginados();
      }
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
      } else if (store.catalogoTabAtiva() === 1) {
        store.loadSubcategoriasPaginadas();
      } else if (store.catalogoTabAtiva() === 2) {
        store.loadTiposServicoPaginados();
      }
    },

    /**=========================
     * AÇÕES PARA OS CHAMADOS
     ===========================*/

    // Ação para abrir um Chamado
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

    // Ação para atribuir um responsável para um Chamado
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

    // Ação para cancelar um Chamado
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

    // Ação para Atualização Administrativa do Chamado
    atualizarDadosAdministrativos: rxMethod<{
      id: number;
      payload: AtualizarDadosAdministrativosRequestDTO;
      onSuccess: () => void;
    }>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(({ id, payload, onSuccess }) =>
          chamadoService.atualizarDadosAdministrativos(id, payload).pipe(
            tapResponse({
              next: (atualizado) => {
                patchState(store, { chamadoDetalhe: atualizado, isLoading: false });
                notificationService.success('Dados operacionais atualizados com sucesso!', 'Administração');
                onSuccess();
              },
              error: (err) => {
                patchState(store, { isLoading: false });
                errorHandler.handle(err, 'Dados Administrativos');
              }
            })
          )
        )
      )
    ),

    /**=========================
     * AÇÕES PARA OS ATENDIMENTOS
     ===========================*/

    // Ação para iniciar um atendimento
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

    // Ação para concluir um atendimento
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
                // Atualiza o cache de subcategorias ativas para dropdowns em cascata
                store.invalidarCachesDropdowns();
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

    salvarSubcategoria: rxMethod<{
      isEdit: boolean;
      id?: number;
      categoriaId: number;
      payload: SubcategoriaRequestDTO;
      onSuccess: () => void;
    }>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(({ isEdit, id, payload, onSuccess }) => {
          const action$ = isEdit
            ? catalogoService.atualizarSubcategoria(id!, payload)
            : catalogoService.criarSubcategoria(payload);

          const acaoNome = isEdit
            ? 'Atualização de Subcategoria'
            : 'Cadastro de Subcategoria';

          return action$.pipe(
            tapResponse({
              next: () => {
                patchState(store, { isLoading: false });
                notificationService.success(
                  `Subcategoria ${isEdit ? 'atualizada' : 'cadastrada'} com sucesso!`,
                  acaoNome
                );
                // Recarrega a tabela de subcategorias da guia ativa
                store.loadSubcategoriasPaginadas();
                // Atualiza o cache de subcategorias ativas para dropdowns em cascata
                store.invalidarCachesDropdowns();
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
        switchMap(({ isEdit, id, payload, onSuccess }) => {
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
                store.loadTiposServicoPaginados();
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

    // ==========================================
    //            ALTERAÇÃO DE STATUS
    // ==========================================

    // [NOVO MÉTODO NA STORE DENTRO DO 2º BLOCO withMethods]
    alterarStatusCategoria: rxMethod<{
      id: number;
      ativo: boolean;
    }>(
      pipe(
        switchMap(({ id, ativo }) =>
          catalogoService.alterarStatusCategoria(id, ativo).pipe(
            tapResponse({
              next: () => {
                notificationService.success(
                  `Categoria ${ativo ? 'ativada' : 'desativada'} com sucesso!`,
                  'Catálogo'
                );
                // Recarrega lista paginada de categorias
                store.loadCategoriasPaginadas();
                // Se a subcategoria estiver aberta, recarrega para refletir novo status
                if (store.catalogoTabAtiva() === 1) {
                  store.loadSubcategoriasPaginadas();
                }
                // Força recarga dos dropdowns em cascata
                store.invalidarCachesDropdowns();
                store.ensureCategoriasAtivasDropdown();
                store.ensureSubcategoriasAtivasDropdown();
              },
              error: (err) => {
                errorHandler.handle(err, 'Alteração de Status');
                store.loadCategoriasPaginadas();
              }
            })
          )
        )
      )
    ),
    /**
     * Alterna o status ativo/inativo da subcategoria a partir do slide-toggle na tabela.
     */
    alterarStatusSubcategoria: rxMethod<{
      id: number;
      categoriaId: number;
      ativo: boolean;
    }>(
      pipe(
        switchMap(({ id, ativo }) =>
          catalogoService.alterarStatusSubcategoria(id, ativo).pipe(
            tapResponse({
              next: () => {
                notificationService.success('Status da subcategoria atualizado!', 'Catálogo');
                // Recarrega a listagem paginada da guia e a lista de ativas
                store.loadSubcategoriasPaginadas();

                if (store.catalogoTabAtiva() === 2) {
                  store.loadTiposServicoPaginados();
                }

                store.invalidarCachesDropdowns();
                store.ensureSubcategoriasAtivasDropdown();
              },
              error: (err) => {
                errorHandler.handle(err, 'Alteração de Status');
                store.loadSubcategoriasPaginadas();
              }
            })
          )
        )
      )
    ),

    /**
     * Alterna o status ativo/inativo do tipo de serviço a partir do slide-toggle na tabela.
     */
    alterarStatusTipoServico: rxMethod<{
      id: number;
      categoriaId: number;
      ativo: boolean;
    }>(
      pipe(
        switchMap(({ id, ativo }) =>
          catalogoService.alterarStatusTipoServico(id, ativo).pipe(
            tapResponse({
              next: () => {
                notificationService.success('Status do serviço atualizado!', 'Catálogo');
                store.loadTiposServicoPaginados();
                store.ensureSubcategoriasAtivasDropdown();
              },
              error: (err) => {
                errorHandler.handle(err, 'Alteração de Status');
                store.loadTiposServicoPaginados();
              }
            })
          )
        )
      )
    )
  }))
);
