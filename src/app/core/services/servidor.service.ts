import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { PageResponse } from '../models/pagination.model';
import { ServidorResponseDTO } from '../models/servidor.model';

@Injectable({
  providedIn: 'root',
})
export class ServidorService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/servidores`;

  listar(page: number = 0, size: number = 10): Observable<PageResponse<ServidorResponseDTO>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<ServidorResponseDTO>>(this.apiUrl, { params });
  }

}
