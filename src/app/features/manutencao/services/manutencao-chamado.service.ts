import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PageResponse } from '../../../shared/model/pagination.model';
import { customHandlerError } from '../../../shared/utils/custom-handler-error';
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
@Injectable({
  providedIn: 'root'
})
export class ManutencaoChamadoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/manutencao/chamados`;
  abrirChamado(payload: AberturaChamadoRequestDTO): Observable<ChamadoDetalheResponseDTO> {
    return this.http.post<ChamadoDetalheResponseDTO>(this.baseUrl, payload)
      .pipe(catchError(customHandlerError));
  }
  listarMeusChamados(page = 0, size = 10): Observable<PageResponse<ChamadoResumoResponseDTO>> {
    const params = new HttpParams().set('page', page).set('size', size);

    return this.http.get<PageResponse<ChamadoResumoResponseDTO>>(`${this.baseUrl}/meus`, { params })
      .pipe(catchError(customHandlerError));
  }
  listarFilaGeral(filtro: ChamadoFilaQueryParams): Observable<PageResponse<ChamadoResumoResponseDTO>> {
    let params = new HttpParams()
      .set('page', filtro.page)
      .set('size', filtro.size);

    if (filtro.estado) params = params.set('estado', filtro.estado);

    if (filtro.categoriaId) params = params.set('categoriaId', filtro.categoriaId);

    if (filtro.tipoServicoId) params = params.set('tipoServicoId', filtro.tipoServicoId);

    if (filtro.andar) params = params.set('andar', filtro.andar);

    if (filtro.salaId) params = params.set('salaId', filtro.salaId);

    if (filtro.responsavelId) params = params.set('responsavelId', filtro.responsavelId);

    return this.http.get<PageResponse<ChamadoResumoResponseDTO>>(this.baseUrl, { params })
      .pipe(catchError(customHandlerError));
  }
  buscarDetalhes(id: number): Observable<ChamadoDetalheResponseDTO> {
    return this.http.get<ChamadoDetalheResponseDTO>(`${this.baseUrl}/${id}`)
      .pipe(catchError(customHandlerError));
  }
  atribuirResponsavel(id: number, payload: AtribuicaoChamadoRequestDTO): Observable<ChamadoDetalheResponseDTO> {
    return this.http.post<ChamadoDetalheResponseDTO>(`${this.baseUrl}/${id}/atribuicao`, payload)
      .pipe(catchError(customHandlerError));
  }
  iniciarAtendimento(id: number, payload?: IniciarAtendimentoRequestDTO): Observable<ChamadoDetalheResponseDTO> {
    return this.http.post<ChamadoDetalheResponseDTO>(`${this.baseUrl}/${id}/iniciar`, payload ?? {})
      .pipe(catchError(customHandlerError));
  }
  concluirAtendimento(id: number, payload?: ConcluirChamadoRequestDTO): Observable<ChamadoDetalheResponseDTO> {
    return this.http.post<ChamadoDetalheResponseDTO>(`${this.baseUrl}/${id}/concluir`, payload ?? {})
      .pipe(catchError(customHandlerError));
  }
  cancelarChamado(id: number, payload: CancelarChamadoRequestDTO): Observable<ChamadoDetalheResponseDTO> {
    return this.http.post<ChamadoDetalheResponseDTO>(`${this.baseUrl}/${id}/cancelar`, payload)
      .pipe(catchError(customHandlerError));
  }
}
