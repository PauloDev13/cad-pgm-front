import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { catchError, firstValueFrom, map, Observable } from 'rxjs';
import { PageResponse } from '../../../shared/model/pagination.model';
import {
  IServidorExcludedQueryParams,
  IServidorQueryParams,
  ServidorRequestDTO,
  ServidorResponseDTO,
  TServidorDelete
} from '../models/servidor.model';
import { customHandlerError } from '../../../shared/utils/custom-handler-error';

@Injectable({
  providedIn: 'root'
})
export class ServidorService {
  // Injeções de dependências
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/servidores`;
  protected readonly DEFAULT_PHOTO = '/img/default_photo.jpg';

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
    { page, size, cpf, matricula, nome, statusId, cargoId, setorId }: IServidorQueryParams
  ): Observable<PageResponse<ServidorResponseDTO>> {
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

    return this.http
      .get<PageResponse<ServidorResponseDTO>>(`${this.apiUrl}/searchFilter`, { params })
      .pipe(catchError(customHandlerError));
  }

  // Busca um cadastro por ID
  findById(id: number): Observable<ServidorResponseDTO> {
    return this.http.get<ServidorResponseDTO>(`${this.apiUrl}/${id}`)
      .pipe(catchError(customHandlerError));
  }

  // Remove um cadastro
  delete(payload: TServidorDelete): Observable<void> {
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
  searchExcluded({ term, page, size }: IServidorExcludedQueryParams
  ): Observable<PageResponse<ServidorResponseDTO>> {
    let params = new HttpParams().set('page', page).set('size', size);

    if (term && term.trim() !== '') {
      params = params.set('term', term);
    }

    return this.http.get<PageResponse<ServidorResponseDTO>>(
      `${this.apiUrl}/searchExcluded`, { params }
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
  downloadPhoto(servidorId: number, cacheBuster?: number): Observable<Blob> {
    let url = `${this.apiUrl}/${servidorId}/photo`;

    if (cacheBuster) {
      url += `?t=${cacheBuster}`;
    }
    return this.http.get(url, { responseType: 'blob' });
  }

  // Monta a URL da foto do Servidor a partir do seu ID
  async loadPhotoServidor(id: number) {
      return firstValueFrom(
        this.downloadPhoto(id).pipe(
          map((blob: Blob) => URL.createObjectURL(blob)),
        )
      ).catch((e) => {
        customHandlerError(e);
        return this.DEFAULT_PHOTO;
      });
  }

  // SVG padrão codificado em data URI para dispensar requisições extras
  readonly defaultFallbackPhoto =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#9CA3AF">
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
      </svg>
    `);
}
