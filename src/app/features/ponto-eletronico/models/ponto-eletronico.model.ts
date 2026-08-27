export interface GeneratePayload {
  cpf: string;
  unit: string;
  dateStart: string;
  dateEnd: string;
  excel: boolean;
  pdf: boolean;
}

export interface JobFile {
  name: string;
  format: 'xlsx' | 'pdf';
}

export type JobStatus = 'QUEUED' | 'RUNNING' | 'DONE' | 'FAILED' | 'CANCELLED';

export interface JobProgress {
  percent: number;
  message: string;
  monthsTotal: number;
  monthsOk: number;
}

export interface Job {
  id: string;
  status: JobStatus;
  payload: GeneratePayload;
  progress: JobProgress | null;
  files: JobFile[];
  error: string | null;
  createdAt: string;
}

export interface JobHistoryItem {
  id: string;
  status: JobStatus;
  payload: GeneratePayload;
  files: JobFile[];
  error: string | null;
  createdAt: string;
}

export interface Unidade {
  code: string;
  description: string;
}

export interface ValidateResponse {
  valid: boolean;
  errors: Record<string, string>;
}

export interface JobResponse {
  ok: boolean;
  job: Job;
  message?: string;
  errors?: Record<string, string>;
}

export interface HistoryResponse {
  ok: boolean;
  jobs: JobHistoryItem[];
}

export interface UnidadesResponse {
  ok: boolean;
  count: number;
  results: Unidade[];
}
