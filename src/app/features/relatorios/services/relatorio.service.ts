import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { catchError, Observable } from 'rxjs';
import { AniversarianteModel } from '../models/aniversariente.model';
import { customHandlerError } from '../../../shared/utils/custom-handler-error';

@Injectable({
  providedIn: 'root'
})
export class RelatorioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/servidores`;

  getAniversariantesMes(): Observable<AniversarianteModel[]> {
    return this.http.get<AniversarianteModel[]>(`${this.apiUrl}/aniversariantes`)
      .pipe(
        catchError(customHandlerError)
      );
  }
}
