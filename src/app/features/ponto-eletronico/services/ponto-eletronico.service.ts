import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  GeneratePayload,
  ValidateResponse,
  JobResponse,
  Job,
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

  getJob(jobId: string): Observable<{ ok: boolean; job: Job }> {
    return this.http.get<{ ok: boolean; job: Job }>(`${this.baseUrl}/jobs/${jobId}`, this.opts);
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

  getDownloadUrl(jobId: string, format: string): string {
    return `${this.baseUrl}/jobs/${jobId}/download?format=${format}`;
  }

  getFileUrl(jobId: string, fileName: string): string {
    return `${this.baseUrl}/jobs/${jobId}/files/${encodeURIComponent(fileName)}`;
  }

  getHistory(limit = 20): Observable<HistoryResponse> {
    return this.http.get<HistoryResponse>(`${this.baseUrl}/jobs?limit=${limit}`, this.opts);
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
