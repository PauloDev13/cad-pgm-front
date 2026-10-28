import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { customHandlerError } from '../../../shared/utils/custom-handler-error';
import {
  CategoriaDemandaRequestDTO,
  CategoriaDemandaResponseDTO, SpringPage,
  TipoServicoRequestDTO,
  TipoServicoResponseDTO
} from '../models/manutencao-catalogo.model';

@Injectable({
  providedIn: 'root'
})
export class ManutencaoCatalogoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/manutencao`;

  /**
   * POPULA O <mat-select> DE FILTRO DA DA ABA TIPOS DE SERVIÇO
   */
  // listarCategorias(): Observable<CategoriaDemandaResponseDTO[]> {
  //   return this.http.get<CategoriaDemandaResponseDTO[]>(`${this.baseUrl}/categorias`)
  //     .pipe(catchError(customHandlerError));
  // }

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

  /**
   * POPULA O <mat-select> DE FILTRO DA ABA "TIPOS DE SERVIÇO" COM AS CATEGORIAS ATIVAS
   */
  listarCategoriasAtivas(): Observable<CategoriaDemandaResponseDTO[]> {
    return this.http.get<CategoriaDemandaResponseDTO[]>(`${this.baseUrl}/categorias-ativas`)
      .pipe(catchError(customHandlerError));
  }

  /*
    BUSCA TODOS OS TIPOS DE SERVIÇOS (ATIVOS E INATIVOS) POR CATEGORIA
   */
  // listarTiposPorCategoria(categoriaId: number): Observable<TipoServicoResponseDTO[]> {
  //   return this.http.get<TipoServicoResponseDTO[]>(`${this.baseUrl}/categorias/${categoriaId}/tipos-servico`)
  //     .pipe(catchError(customHandlerError));
  // }

  /**
   * GUIA 2: BUSCA TIPOS DE SERVIÇO DE FORMA PAGINADA PARA UMA DADA CATEGORIA
   */
  listarTiposPorCategoriaPaginados(
    categoriaId: number,
    page: number = 0,
    size: number = 10
  ): Observable<SpringPage<TipoServicoResponseDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<SpringPage<TipoServicoResponseDTO>>(
      `${this.baseUrl}/categorias/${categoriaId}/tipos-servico/paginados`, { params })
      .pipe(catchError(customHandlerError));
  }

  /*
    BUSCA OS TIPOS DE SERVIÇOS ATIVOS POR CATEGORIA
   */
  listarTiposAtivosPorCategoria(categoriaId: number): Observable<TipoServicoResponseDTO[]> {
    return this.http.get<TipoServicoResponseDTO[]>(
      `${this.baseUrl}/categorias/${categoriaId}/tipos-servico-ativos`)
      .pipe(catchError(customHandlerError));
  }

  criarCategoria(payload: CategoriaDemandaRequestDTO): Observable<CategoriaDemandaResponseDTO> {
    return this.http.post<CategoriaDemandaResponseDTO>(
      `${this.baseUrl}/admin/categorias`, payload)
      .pipe(catchError(customHandlerError));
  }

  atualizarCategoria(
    id: number,
    payload: CategoriaDemandaRequestDTO
  ): Observable<CategoriaDemandaResponseDTO> {
    return this.http.put<CategoriaDemandaResponseDTO>(
      `${this.baseUrl}/admin/categorias/${id}`, payload)
      .pipe(catchError(customHandlerError));
  }

  criarTipoServico(payload: TipoServicoRequestDTO): Observable<TipoServicoResponseDTO> {
    return this.http.post<TipoServicoResponseDTO>(
      `${this.baseUrl}/admin/tipos-servico`, payload)
      .pipe(catchError(customHandlerError));
  }

  atualizarTipoServico(id: number, payload: TipoServicoRequestDTO): Observable<TipoServicoResponseDTO> {
    return this.http.put<TipoServicoResponseDTO>(
      `${this.baseUrl}/admin/tipos-servico/${id}`, payload)
      .pipe(catchError(customHandlerError));
  }

  alterarStatusTipoServico(id: number, ativo: boolean): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/admin/tipos-servico/${id}/status?ativo=${ativo}`, {})
      .pipe(catchError(customHandlerError));
  }
}
