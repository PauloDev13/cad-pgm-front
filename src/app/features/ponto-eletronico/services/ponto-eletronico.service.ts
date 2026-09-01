import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  GeneratePayload,
  ValidateResponse,
  JobResponse,
  HistoryResponse,
  UnidadesResponse,
} from '../models/ponto-eletronico.model';

@Injectable({ providedIn: 'root' })
export class PontoEletronicoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/python-api/api/v1';

  private readonly opts = { withCredentials: true } as const;

  validate(payload: GeneratePayload): Observable<ValidateResponse> {
    return this.http.post<ValidateResponse>(`${this.baseUrl}/validate`, payload, this.opts);
  }

  createJob(payload: GeneratePayload): Observable<JobResponse> {
    return this.http.post<JobResponse>(`${this.baseUrl}/jobs`, payload, this.opts);
  }

  cancelJob(jobId: string): Observable<{ ok: boolean; message?: string }> {
    return this.http.post<{ ok: boolean; message?: string }>(
      `${this.baseUrl}/jobs/${jobId}/cancel`, {}, this.opts
    );
  }

  deleteJob(jobId: string): Observable<{ ok: boolean; message?: string }> {
    return this.http.delete<{ ok: boolean; message?: string }>(
      `${this.baseUrl}/jobs/${jobId}`, this.opts
    );
  }

  getJobEventsUrl(jobId: string): string {
    return `${this.baseUrl}/jobs/${jobId}/events`;
  }

  downloadJobBlob(jobId: string, format: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/jobs/${jobId}/download?format=${format}`, {
      ...this.opts,
      responseType: 'blob' as const,
    });
  }

  downloadFileBlob(jobId: string, fileName: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/jobs/${jobId}/files/${encodeURIComponent(fileName)}`, {
      ...this.opts,
      responseType: 'blob' as const,
    });
  }

  getHistory(limit?: number): Observable<HistoryResponse> {
    const url = limit ? `${this.baseUrl}/jobs?limit=${limit}` : `${this.baseUrl}/jobs`;
    return this.http.get<HistoryResponse>(url, this.opts);
  }

  deleteHistory(): Observable<{ ok: boolean; removed: number; message?: string }> {
    return this.http.delete<{ ok: boolean; removed: number; message?: string }>(
      `${this.baseUrl}/jobs`, this.opts
    );
  }

  searchUnidades(query: string): Observable<UnidadesResponse> {
    return this.http.get<UnidadesResponse>(
      `${this.baseUrl}/unidades?q=${encodeURIComponent(query)}`, this.opts
    );
  }
}
