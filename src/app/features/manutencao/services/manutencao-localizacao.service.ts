
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { customHandlerError } from '../../../shared/utils/custom-handler-error';
import { AndarCodigo } from '../models/manutencao-enums.model';
import { AndarResponseDTO, SalaResponseDTO } from '../models/manutencao-catalogo.model';

@Injectable({
  providedIn: 'root'
})
export class ManutencaoLocalizacaoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/manutencao`;

  listarAndares(): Observable<AndarResponseDTO[]> {
    return this.http.get<AndarResponseDTO[]>(`${this.baseUrl}/andares`)
      .pipe(catchError(customHandlerError));
  }

  listarSalasPorAndar(andar: AndarCodigo): Observable<SalaResponseDTO[]> {
    const params = new HttpParams().set('andar', andar);

    return this.http.get<SalaResponseDTO[]>(`${this.baseUrl}/salas`, { params })
      .pipe(catchError(customHandlerError));
  }
}
