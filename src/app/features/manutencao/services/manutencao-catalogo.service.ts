import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { customHandlerError } from '../../../shared/utils/custom-handler-error';
import {
  CategoriaDemandaRequestDTO,
  CategoriaDemandaResponseDTO,
  TipoServicoRequestDTO,
  TipoServicoResponseDTO
} from '../models/manutencao-catalogo.model';

@Injectable({
  providedIn: 'root'
})
export class ManutencaoCatalogoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/manutencao`;

  listarCategoriasAtivas(): Observable<CategoriaDemandaResponseDTO[]> {
    return this.http.get<CategoriaDemandaResponseDTO[]>(`${this.baseUrl}/categorias`)
      .pipe(catchError(customHandlerError));
  }

  listarTiposPorCategoria(categoriaId: number): Observable<TipoServicoResponseDTO[]> {
    return this.http.get<TipoServicoResponseDTO[]>(`${this.baseUrl}/categorias/${categoriaId}/tipos-servico`)
      .pipe(catchError(customHandlerError));
  }

  criarCategoria(payload: CategoriaDemandaRequestDTO): Observable<CategoriaDemandaResponseDTO> {
    return this.http.post<CategoriaDemandaResponseDTO>(`${this.baseUrl}/admin/categorias`, payload)
      .pipe(catchError(customHandlerError));
  }

  atualizarCategoria(id: number, payload: CategoriaDemandaRequestDTO): Observable<CategoriaDemandaResponseDTO> {
    return this.http.put<CategoriaDemandaResponseDTO>(`${this.baseUrl}/admin/categorias/${id}`, payload)
      .pipe(catchError(customHandlerError));
  }

  criarTipoServico(payload: TipoServicoRequestDTO): Observable<TipoServicoResponseDTO> {
    return this.http.post<TipoServicoResponseDTO>(`${this.baseUrl}/admin/tipos-servico`, payload)
      .pipe(catchError(customHandlerError));
  }

  atualizarTipoServico(id: number, payload: TipoServicoRequestDTO): Observable<TipoServicoResponseDTO> {
    return this.http.put<TipoServicoResponseDTO>(`${this.baseUrl}/admin/tipos-servico/${id}`, payload)
      .pipe(catchError(customHandlerError));
  }

  alterarStatusTipoServico(id: number, ativo: boolean): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/admin/tipos-servico/${id}/status?ativo=${ativo}`, {})
      .pipe(catchError(customHandlerError));
  }
}
