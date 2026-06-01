import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { catchError, Observable } from 'rxjs';
import { AniversarianteModel } from '../models/aniversariente.model';
import { customHandlerError } from '../../../shared/utils/custom-handler-error';
import { FolhaPontoSetorDTO } from '../models/folha-ponto.model';

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

  gerarFolhaMes(): Observable<FolhaPontoSetorDTO[]> {
    return this.http.get<FolhaPontoSetorDTO[]>(`${this.apiUrl}/folha-ponto`);
  }
}
