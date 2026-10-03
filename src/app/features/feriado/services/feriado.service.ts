import { Injectable } from '@angular/core';
import { FeriadoRequestDTO, FeriadoResponseDTO, FeriadoStatusPatchDTO } from '../models/feriado.model';
import { BaseGenericService } from '../../../shared/service/generic/base-generic.service';
import { catchError, Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { customHandlerError } from '../../../shared/utils/custom-handler-error';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FeriadoService extends BaseGenericService<FeriadoRequestDTO, FeriadoResponseDTO> {
  private readonly apiUrl = `${environment.apiUrl}/api/v1`;

  protected get endpoint(): string {
    return 'feriados';
  }

  /*
   * Busca feriados ativos para o relatório de folha de ponto
   */
  findAtivos(mes?: number): Observable<FeriadoResponseDTO[]> {
    let params = new HttpParams();

    if (mes !== undefined && mes !== null) {
      params = params.set('mes', mes);
    }
    return this.http
      .get<FeriadoResponseDTO[]>(`${this.apiUrl}/${this.endpoint}/ativos`, { params })
      .pipe(catchError(customHandlerError));
  }

  /**
   * Alterna atomicamente o status do checkbox de um feriado
   */
  toggleStatus(id: number, ativo: boolean): Observable<FeriadoResponseDTO> {
    const payload: FeriadoStatusPatchDTO = { ativo };
    return this.http
      .patch<FeriadoResponseDTO>(`${this.apiUrl}/${this.endpoint}/${id}/status`, payload)
      .pipe(catchError(customHandlerError));
  }
}
