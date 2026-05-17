import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { catchError, Observable } from 'rxjs';
import { customHandlerError } from '../../../shared/utils/custom-handler-error';
import { DocumentUploadModel } from '../models/document-upload.model';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private readonly http = inject(HttpClient);
  private readonly API = `${environment.apiUrl}/api/v1/servidores`;

  uploadDocument(servidorId: number, files: File[]): Observable<string> {
    const formData = new FormData();
    files.forEach((file: File) => {
      formData.append('files', file);
    });
    // Omitimos o Content-Type para o browser definir o boundary do FormData
    return this.http.post(`${this.API}/${servidorId}/documents`, formData, {
      responseType: 'text'
    }).pipe(catchError(customHandlerError));
  }

  listDocuments(servidorId: number): Observable<DocumentUploadModel[]> {
    return this.http.get<DocumentUploadModel[]>(`${this.API}/${servidorId}/documents`)
      .pipe(catchError(customHandlerError));
  }

  getDocumentPreviewLink(documentoId: number): Observable<string> {
    return this.http.get(`${this.API}/documents/${documentoId}/link`, {
      responseType: 'text'
    }).pipe(catchError(customHandlerError));
  }

  // Exclusão única
  deleteDocument(documentoId: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/documents/${documentoId}`)
      .pipe(catchError(customHandlerError));
  }

  // Exclusão em Lote
  deleteDocumentBatch(documentIds: number[]): Observable<void> {
    // Atenção à sintaxe para enviar Body numa requisição DELETE
    return this.http.delete<void>(`${this.API}/documents/batch`, {
      body: documentIds
    }).pipe(catchError(customHandlerError));
  }

  // Envia a foto para o backend
  uploadProfilePicture(servidorId: number, photo: File): Observable<void> {
    const formData = new FormData();

    formData.append('file', photo); // 'file' é o nome do @RequestParam no Spring Boot

    return this.http.post<void>(`${this.API}/${servidorId}/photo`, formData)
      .pipe(
        catchError(customHandlerError)
      );
  }

  // Monta a URL de visualização da foto para a tag <img>
  downloadPhoto(servidorId: number): Observable<Blob> {
    const timestamp = new Date().getTime();
    return this.http.get(`${this.API}/${servidorId}/photo?t=${timestamp}`, {
      responseType: 'blob'
    });
  }
}
