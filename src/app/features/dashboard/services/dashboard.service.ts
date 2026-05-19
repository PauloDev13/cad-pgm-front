import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { DashboardResumoDTO } from '../models/dashboard.model';
import { customHandlerError } from '../../../shared/utils/custom-handler-error';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/dashboards`;

  getResumoServidores(): Observable<DashboardResumoDTO> {
    return this.http.get<DashboardResumoDTO>(`${(this.apiUrl)}/servidores-resumo`)
      .pipe(
        catchError(customHandlerError)
      );
  }
}
