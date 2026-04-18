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
}
