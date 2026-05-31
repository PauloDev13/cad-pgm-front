import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { catchError, Observable } from 'rxjs';
import { AniversarianteModel } from '../models/aniversariente.model';
import { customHandlerError } from '../../../shared/utils/custom-handler-error';
import { FolhaPontoDTO } from '../models/folha-ponto.model';

@Injectable({
  providedIn: 'root'
})
export class RelatorioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/servidores`;

  // Busca a lista de aniversariantes informando o parâmetro mês
  getAniversariantesMes(month: number): Observable<AniversarianteModel[]> {
    const params = new HttpParams().set('month', month);
    return this.http.get<AniversarianteModel[]>(`${this.apiUrl}/aniversariantes`, {
      params
    }).pipe(catchError(customHandlerError));
  }

  gerarFolhaMes(setorId: number) {
    // Monta os parâmetros obrigatórios
    let params = new HttpParams().set('setorId', setorId);
    return this.http.get<FolhaPontoDTO[]>(`${this.apiUrl}/folha-ponto`, { params });
  }
}
