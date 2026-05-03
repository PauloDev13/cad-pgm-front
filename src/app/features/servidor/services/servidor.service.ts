import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { catchError, Observable, throwError } from 'rxjs';
import { PageResponse } from '../../../shared/model/pagination.model';
import { ServidorRequestDTO, ServidorResponseDTO } from '../models/servidor.model';

@Injectable({
  providedIn: 'root'
})
export class ServidorService {
  // Injeções de dependências
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/servidores`;


  // MÉTODOS PARA GERENCIAMENTO DE CADASTROS ATIVOS

  // Cria um novo cadastro
  create(data: ServidorRequestDTO): Observable<ServidorResponseDTO> {
    return this.http.post<ServidorResponseDTO>(this.apiUrl, data)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          console.error('Erro ao processar solicitação', err.error);
          const msg = err.error.message || err.error || 'Erro ao processar solicitação';
          return throwError(() => new Error(msg));
        })
      );
  }

  // Atualiza um cadastro existente
  update(id: number, data: ServidorRequestDTO): Observable<ServidorResponseDTO> {
    return this.http.put<ServidorResponseDTO>(`${this.apiUrl}/${id}`, data)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          console.error('Erro ao processar solicitação', err.error);
          const msg = err.error.message || err.error || 'Erro ao processar solicitação';
          return throwError(() => new Error(msg));
        })
      );
  }

  // Pesquisa avançada paginada por CPF, Matrícula ou Nome
  searchFilter(
    page: number,
    size: number,
    statusId?: number | null,
    cpf?: string,
    matricula?: string,
    nome?: string
  ): Observable<PageResponse<ServidorResponseDTO[]>> {
    let params = new HttpParams().set('page', page).set('size', size);

    if (statusId !== null && statusId !== undefined) {
      params = params.set('statusId', statusId.toString());
    }

    if (cpf && cpf.trim() !== '') {
      params = params.set('cpf', cpf.trim());
    }

    if (matricula && matricula.trim() !== '') {
      params = params.set('matricula', matricula.trim());
    }

    if (nome && nome.trim() !== '') {
      params = params.set('nome', nome.trim());
    }

    return this.http.get<PageResponse<ServidorResponseDTO[]>>(`${this.apiUrl}/searchFilter`, {
      params
    })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          console.error('Erro ao processar solicitação', err.error);
          const msg = err.error.message || err.error || 'Erro ao processar solicitação';
          return throwError(() => new Error(msg));
        })
      );

  }

  // Busca todos os cadastros
  findAll(page: number = 0, size: number = 10): Observable<PageResponse<ServidorResponseDTO>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<ServidorResponseDTO>>(this.apiUrl, { params })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          console.error('Erro ao processar solicitação', err.error);
          const msg = err.error.message || err.error || 'Erro ao processar solicitação';
          return throwError(() => new Error(msg));
        })
      );
  }

  // Busca um cadastro por ID
  findById(id: number): Observable<ServidorResponseDTO> {
    return this.http.get<ServidorResponseDTO>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          console.error('Erro ao processar solicitação', err.error);
          const msg = err.error.message || err.error || 'Erro ao processar solicitação';
          return throwError(() => new Error(msg));
        })
      );
  }

  // Remove um cadastro
  delete(payload: ServidorResponseDTO): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${payload.id}`)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          console.error('Erro ao processar solicitação', err.error);
          const msg = err.error.message || err.error || 'Erro ao processar solicitação';
          return throwError(() => new Error(msg));
        })
      );
  }

  // MÉTODOS PARA GERENCIAMENTO DE CADASTROS EXCLUÍDOS

  // Reativa um cadastro excluído
  reactivate(id: number, payload: ServidorRequestDTO): Observable<ServidorResponseDTO> {
    return this.http.patch<ServidorResponseDTO>(`${this.apiUrl}/${id}/reactivate`, payload)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          console.error('Erro ao processar solicitação', err.error);
          const msg = err.error.message || err.error || 'Erro ao processar solicitação';
          return throwError(() => new Error(msg));
        })
      );
  }

  // Pesquisa avançada paginada por CPF ou Nome
  searchExcluded(term: string, page: number, size: number): Observable<PageResponse<ServidorResponseDTO>> {
    let params = new HttpParams().set('term', term).set('page', page).set('size', size);

    return this.http.get<PageResponse<ServidorResponseDTO>>(
      `${this.apiUrl}/searchExcluded`, { params }
    )
      .pipe(
        catchError((err: HttpErrorResponse) => {
          console.error('Erro ao processar solicitação', err.error);
          const msg = err.error.message || err.error || 'Erro ao processar solicitação';
          return throwError(() => new Error(msg));
        })
      );
  }

  // Busca todos os cadastros excluídos
  getExcluded(page: number, size: number): Observable<PageResponse<ServidorResponseDTO>> {
    return this.http.get<PageResponse<ServidorResponseDTO>>(
      `${this.apiUrl}/excluded?page=${page}&size=${size}`
    )
      .pipe(
        catchError((err: HttpErrorResponse) => {
          console.error('Erro ao processar solicitação', err.error);
          const msg = err.error.message || err.error || 'Erro ao processar solicitação';
          return throwError(() => new Error(msg));
        })
      );
  }
}
