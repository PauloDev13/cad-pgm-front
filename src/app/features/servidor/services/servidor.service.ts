import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { catchError, Observable } from 'rxjs';
import { PageResponse } from '../../../shared/model/pagination.model';
import { ServidorRequestDTO, ServidorResponseDTO } from '../models/servidor.model';
import { customHandlerError } from '../../../shared/utils/custom-handler-error';

@Injectable({
  providedIn: 'root'
})
export class ServidorService {
  // Injeções de dependências
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/servidores`;


  // 1. MÉTODOS PARA GERENCIAMENTO DE CADASTROS ATIVOS
  // Cria um novo cadastro
  create(data: ServidorRequestDTO): Observable<ServidorResponseDTO> {
    return this.http.post<ServidorResponseDTO>(this.apiUrl, data)
      .pipe(catchError(customHandlerError));
  }

  // Atualiza um cadastro existente
  update(id: number, data: ServidorRequestDTO): Observable<ServidorResponseDTO> {
    return this.http.put<ServidorResponseDTO>(`${this.apiUrl}/${id}`, data)
      .pipe(catchError(customHandlerError));
  }

  // Pesquisa avançada paginada por CPF, Matrícula ou Nome
  searchFilter(
    page: number,
    size: number,
    cpf?: string,
    matricula?: string,
    nome?: string,
    statusId?: number | null,
    cargoId?: number | null,
    setorId?: number | null
  ): Observable<PageResponse<ServidorResponseDTO[]>> {
    let params = new HttpParams().set('page', page).set('size', size);

    if (statusId !== null && statusId !== undefined) {
      params = params.set('statusId', statusId.toString());
    }

    if (cargoId !== null && cargoId !== undefined) {
      params = params.set('cargoId', cargoId.toString());
    }

    if (setorId !== null && setorId !== undefined) {
      params = params.set('setorId', setorId.toString());
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
      .pipe(catchError(customHandlerError));
  }

  // Busca todos os cadastros
  findAll(page: number = 0, size: number = 10): Observable<PageResponse<ServidorResponseDTO>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<ServidorResponseDTO>>(this.apiUrl, { params })
      .pipe(catchError(customHandlerError));
  }

  // Busca um cadastro por ID
  findById(id: number): Observable<ServidorResponseDTO> {
    return this.http.get<ServidorResponseDTO>(`${this.apiUrl}/${id}`)
      .pipe(catchError(customHandlerError));
  }

  // Remove um cadastro
  delete(payload: ServidorResponseDTO): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${payload.id}`)
      .pipe(catchError(customHandlerError));
  }

  // 2. MÉTODOS PARA GERENCIAMENTO DE CADASTROS EXCLUÍDOS
  // Reativa um cadastro excluído
  reactivate(id: number, payload: ServidorRequestDTO): Observable<ServidorResponseDTO> {
    return this.http.patch<ServidorResponseDTO>(`${this.apiUrl}/${id}/reactivate`, payload)
      .pipe(catchError(customHandlerError));
  }

  // Pesquisa avançada paginada por CPF ou Nome
  searchExcluded(term: string, page: number, size: number): Observable<PageResponse<ServidorResponseDTO>> {
    let params = new HttpParams().set('term', term).set('page', page).set('size', size);

    return this.http.get<PageResponse<ServidorResponseDTO>>(
      `${this.apiUrl}/searchExcluded`, { params }
    )
      .pipe(catchError(customHandlerError));
  }

  // Busca todos os cadastros excluídos
  getExcluded(page: number, size: number): Observable<PageResponse<ServidorResponseDTO>> {
    return this.http.get<PageResponse<ServidorResponseDTO>>(
      `${this.apiUrl}/excluded?page=${page}&size=${size}`
    )
      .pipe(catchError(customHandlerError));
  }

  getExcludedById(id: number): Observable<ServidorResponseDTO> {
    return this.http.get<ServidorResponseDTO>(
      `${this.apiUrl}/excluded/${id}`
    )
      .pipe(catchError(customHandlerError));
  }


  // Envia a foto para o backend
  uploadProfilePicture(servidorId: number, photo: File): Observable<void> {
    const formData = new FormData();

    formData.append('file', photo); // 'file' é o nome do @RequestParam no Spring Boot

    return this.http.post<void>(`${this.apiUrl}/${servidorId}/photo`, formData)
      .pipe(
        catchError(customHandlerError)
      );
  }

  // Monta a URL de visualização da foto para a tag <img>
  downloadPhoto(servidorId: number): Observable<Blob> {
    const timestamp = new Date().getTime();
    return this.http.get(`${this.apiUrl}/${servidorId}/photo?t=${timestamp}`, {
      responseType: 'blob'
    });
  }
}
