import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { customHandlerError } from '../../../shared/utils/custom-handler-error';
import { DashboardManutencaoResponseDTO } from '../models/manutencao-dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class ManutencaoDashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/manutencao/relatorios/dashboard`;

  getDashboard(dataInicio?: string, dataFim?: string): Observable<DashboardManutencaoResponseDTO> {
    let params = new HttpParams();

    if (dataInicio) params = params.set('dataInicio', dataInicio);

    if (dataFim) params = params.set('dataFim', dataFim);

    return this.http.get<DashboardManutencaoResponseDTO>(this.baseUrl, { params })
      .pipe(catchError(customHandlerError));
  }
}
