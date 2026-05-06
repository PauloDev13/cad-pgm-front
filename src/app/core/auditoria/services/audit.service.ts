import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { catchError, Observable } from 'rxjs';
import { PageResponse } from '../../../shared/model/pagination.model';
import { AuditResponseDTO } from '../models/audit-response.dto';
import { customHandlerError } from '../../../shared/utils/custom-handler-error';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/auditoria`;

  // MÉTODO DA API: Monta os parâmetros dinamicamente apenas se existirem
  searchAuditFilter(
    page: number,
    size: number,
    username?: string | null,
    typeAction?: string | null,
    startDate?: string | null,
    endDate?: string | null
  ): Observable<PageResponse<AuditResponseDTO>> {
    let params: HttpParams = new HttpParams()
      .set('page', page)
      .set('size', size);

    // Se a variável tem valor (não é vazia/nula), adiciona na URL
    if (username && username.trim() !== '') {
      params = params.set('username', username.trim());
    }

    if (typeAction && typeAction.trim() !== '') {
      params = params.set('typeAction', typeAction.trim());
    }

    // Datas já devem chegar aqui formatadas em YYYY-MM-DD
    if (startDate && startDate.trim() !== '') {
      params = params.set('startDate', startDate.trim());
    }

    if (endDate && endDate.trim() !== '') {
      params = params.set('endDate', endDate.trim());
    }

    // Chamada GET com tratamento de erro global padronizado
    return this.http.get<PageResponse<AuditResponseDTO>>(
      `${this.apiUrl}/searchAuditFilter`, { params })
      .pipe(catchError(customHandlerError)
      );
  }
}
