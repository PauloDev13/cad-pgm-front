import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { catchError, Observable } from 'rxjs';
import { AniversarianteModel } from '../models/aniversariente.model';
import { customHandlerError } from '../../../shared/utils/custom-handler-error';
import { FolhaPontoSetorDTO } from '../models/folha-ponto.model';
import { ProcuradorVinculoResponse } from '../models/certificado-vinculo.model';

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

  // retorna a Folha de Ponto mensal recebendo como parâmetros o Mês e a lista de Setores
  gerarFolhaMes(setorIds?: number[]): Observable<FolhaPontoSetorDTO[]> {
    let params: HttpParams = new HttpParams();

    if (setorIds && setorIds.length > 0) {
      setorIds.forEach((id) => {
        params = params.append('setorIds', id.toString());
      });

    }
    return this.http.get<FolhaPontoSetorDTO[]>(`${this.apiUrl}/folha-ponto`, { params })
      .pipe(catchError(customHandlerError));
  }

  // retorna a lista de servidores vinculados ao certificado digital dos procuradores.
  // Recebe como parâmetro uma lista de procuradores
  getCertificadosVinculados(procuradores?: string[]): Observable<ProcuradorVinculoResponse[]> {
    let params: HttpParams = new HttpParams();

    if (procuradores && procuradores.length > 0) {
      procuradores.forEach((nome) => {
        params = params.append('procuradores', nome);
      });
    }
    return this.http
      .get<ProcuradorVinculoResponse[]>(`${this.apiUrl}/vinculos`, { params })
      .pipe(catchError(customHandlerError));
  }
}

