import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { customHandlerError } from '../../../shared/utils/custom-handler-error';
import {
  CategoriaDemandaRequestDTO,
  CategoriaDemandaResponseDTO,
  SpringPage,
  SubcategoriaFiltroParams,
  SubcategoriaRequestDTO,
  SubcategoriaResponseDTO,
  TipoServicoFiltroParams,
  TipoServicoRequestDTO,
  TipoServicoResponseDTO
} from '../models/manutencao-catalogo.model';

@Injectable({
  providedIn: 'root'
})
export class ManutencaoCatalogoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/manutencao`;

  // ==============================================
  //        LISTA PARA TABELAS DAS GUIAS
  // ==============================================

  /**
   * ABA 1: BUSCA CATEGORIAS DE FORMA PAGINADA
   */
  listarCategoriasPaginadas(
    page: number = 0,
    size: number = 10
  ): Observable<SpringPage<CategoriaDemandaResponseDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<SpringPage<CategoriaDemandaResponseDTO>>(
      `${this.baseUrl}/categorias/paginadas`, { params })
      .pipe(catchError(customHandlerError));
  }

  // 1. Listagem Paginada de Subcategorias com Filtro Dinâmico
  listarSubcategoriasPaginadas(
    filtro: SubcategoriaFiltroParams
  ): Observable<SpringPage<SubcategoriaResponseDTO>> {
    let params = new HttpParams()
      .set('page', filtro.page.toString())
      .set('size', filtro.size.toString());

    if (filtro.categoriaId) {
      params = params.set('categoriaId', filtro.categoriaId.toString());
    }

    // if (filtro.ativo !== undefined && filtro.ativo !== null) {
    //   params = params.set('ativo', filtro.ativo.toString());
    // }

    return this.http.get<SpringPage<SubcategoriaResponseDTO>>(
      `${this.baseUrl}/subcategorias/paginadas`, { params }
    ).pipe(
      catchError(() => {
        // Fallback gracioso para a rota legada caso categoriaId exista
        if (filtro.categoriaId) {
          return this.http.get<SpringPage<SubcategoriaResponseDTO>>(
            `${this.baseUrl}/categorias/${filtro.categoriaId}/subcategorias/paginadas`,
            { params: new HttpParams().set('page', filtro.page.toString()).set('size', filtro.size.toString()) }
          );
        }
        throw new Error('Endpoint de subcategorias paginadas não configurado.');
      }),
      catchError(customHandlerError)
    );
  }

  // 2. Listagem Paginada de Tipos de Serviço com Filtro Dinâmico
  listarTiposServicoPaginados(
    filtro: TipoServicoFiltroParams
  ): Observable<SpringPage<TipoServicoResponseDTO>> {
    let params = new HttpParams()
      .set('page', filtro.page.toString())
      .set('size', filtro.size.toString());

    if (filtro.subcategoriaId) {
      params = params.set('subcategoriaId', filtro.subcategoriaId.toString());
    }

    if (filtro.ativo !== undefined && filtro.ativo !== null) {
      params = params.set('ativo', filtro.ativo.toString());
    }

    return this.http.get<SpringPage<TipoServicoResponseDTO>>(
      `${this.baseUrl}/tipos-servico/paginados`, { params }
    ).pipe(
      catchError(() => {
        // Fallback para rota legada se subcategoriaId estiver preenchido
        if (filtro.subcategoriaId) {
          return this.http.get<SpringPage<TipoServicoResponseDTO>>(
            `${this.baseUrl}/subcategorias/${filtro.subcategoriaId}/tipos-servico/paginados`,
            { params: new HttpParams().set('page', filtro.page.toString()).set('size', filtro.size.toString()) }
          );
        }
        throw new Error('Endpoint de tipos de serviço paginados não configurado.');
      }),
      catchError(customHandlerError)
    );
  }

  // ========================================
  //        LISTAS PARA OS DROPDOWNS
  // ========================================

  /**
   * POPULA O DROPDOWN DE FILTRO DA ABA "SUBCATEGORIAS" COM AS CATEGORIAS ATIVAS
   */
  listarCategoriasAtivas(): Observable<CategoriaDemandaResponseDTO[]> {
    return this.http.get<CategoriaDemandaResponseDTO[]>(`${this.baseUrl}/categorias-ativas`)
      .pipe(catchError(customHandlerError));
  }

  /**
   * POPULA O DROPDOWN EM CASCATA DA GUIA "TIPOS DE SERVIÇOS" E DO FORMULÁRIO DE ABERTURA COM
   * AS SUBCATEGORIAS ATIVAS
   */
  listarSubcategoriasAtivas(): Observable<SubcategoriaResponseDTO[]> {
    return this.http.get<SubcategoriaResponseDTO[]>(
      `${this.baseUrl}/subcategorias-ativas`
    ).pipe(catchError(customHandlerError));
  }

  /**
   * RETORNA LISTA DE SUBCATEGORIAS ATIVAS PARA UMA CATEGORIA INFORMADA
   */
  listarSubcategoriasAtivasPorCategoria(
    categoriaId: number): Observable<SubcategoriaResponseDTO[]> {
    return this.http.get<SubcategoriaResponseDTO[]>(
      `${this.baseUrl}/categorias/${categoriaId}/subcategorias-ativas`
    ).pipe(catchError(customHandlerError));
  }

  /**
   * POPULA O DROPDOWN COM AS SUBCATEGORIAS ATIVAS
   */
  listarTiposAtivosPorSubCategoria(
    subcategoriaId: number): Observable<TipoServicoResponseDTO[]> {
    return this.http.get<TipoServicoResponseDTO[]>(
      `${this.baseUrl}/subcategorias/${subcategoriaId}/tipos-servico-ativos`)
      .pipe(catchError(customHandlerError));
  }

  // =========================
  //        CREATE
  // =========================

  /*
    CRIAR UMA NOVA CATEGORIA
   */
  criarCategoria(payload: CategoriaDemandaRequestDTO): Observable<CategoriaDemandaResponseDTO> {
    return this.http.post<CategoriaDemandaResponseDTO>(
      `${this.baseUrl}/admin/categorias`, payload)
      .pipe(catchError(customHandlerError));
  }

  /*
    CRIAR UMA NOVA SUBCATEGORIA
   */
  criarSubcategoria(payload: SubcategoriaRequestDTO): Observable<SubcategoriaResponseDTO> {
    return this.http.post<SubcategoriaResponseDTO>(`${this.baseUrl}/admin/subcategorias`, payload)
      .pipe(catchError(customHandlerError));
  }

  /*
    CRIAR UM NOVO TIPO DE SERVIÇO
   */
  criarTipoServico(payload: TipoServicoRequestDTO): Observable<TipoServicoResponseDTO> {
    return this.http.post<TipoServicoResponseDTO>(
      `${this.baseUrl}/admin/tipos-servico`, payload)
      .pipe(catchError(customHandlerError));
  }

  // =========================
  //        UPDATES
  // =========================

  /*
    ATUALIZAR UMA CATEGORIA
   */
  atualizarCategoria(
    id: number,
    payload: CategoriaDemandaRequestDTO
  ): Observable<CategoriaDemandaResponseDTO> {
    return this.http.put<CategoriaDemandaResponseDTO>(
      `${this.baseUrl}/admin/categorias/${id}`, payload)
      .pipe(catchError(customHandlerError));
  }

  /*
    ATUALIZAR UMA SUBCATEGORIA
   */
  atualizarSubcategoria(
    id: number,
    payload: SubcategoriaRequestDTO
  ): Observable<SubcategoriaResponseDTO> {
    return this.http.put<SubcategoriaResponseDTO>(
      `${this.baseUrl}/admin/subcategorias/${id}`, payload)
      .pipe(catchError(customHandlerError));
  }

  /*
    ATUALIZAR UM TIPO DE SERVIÇO
   */
  atualizarTipoServico(
    id: number,
    payload: TipoServicoRequestDTO
  ): Observable<TipoServicoResponseDTO> {
    return this.http.put<TipoServicoResponseDTO>(
      `${this.baseUrl}/admin/tipos-servico/${id}`, payload)
      .pipe(catchError(customHandlerError));
  }


  // =================================
  //        UPDATES DE STATUS
  // =================================

  /*
  ALTERAR STATUS DE UMA CATEGORIA COM EFEITO CASCATA
*/
  alterarStatusCategoria(
    id: number,
    ativo: boolean
  ): Observable<void> {
    return this.http.patch<void>(
      `${this.baseUrl}/admin/categorias/${id}/status?ativo=${ativo}`, {}
    ).pipe(catchError(customHandlerError));
  }

  /*
    ALTERAR STATUS DE UMA SUBCATEGORIA
   */
  alterarStatusSubcategoria(
    id: number,
    ativo: boolean
  ): Observable<void> {
    return this.http.patch<void>(
      `${this.baseUrl}/admin/subcategorias/${id}/status?ativo=${ativo}`, {})
      .pipe(catchError(customHandlerError));
  }

  /*
    ALTERAR STATUS DE UM TIPO DE SERVIÇO
   */
  alterarStatusTipoServico(
    id: number,
    ativo: boolean
  ): Observable<void> {
    return this.http.patch<void>(
      `${this.baseUrl}/admin/tipos-servico/${id}/status?ativo=${ativo}`, {})
      .pipe(catchError(customHandlerError));
  }
}
