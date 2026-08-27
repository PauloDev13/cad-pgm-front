// ── Auth ────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  ok: boolean;
  user?: string;
  message?: string;
  jobs_active?: number;
}

// ── Validate / Jobs ─────────────────────────────────────────────────────────

export interface GeneratePayload {
  cpf: string;
  unit: string;
  date_start: string;
  date_end: string;
  excel: boolean;
  pdf: boolean;
}

export interface ValidateResponse {
  valid: boolean;
  errors: Record<string, string>;
  fields?: Record<string, string | boolean>;
}

// ── Job ─────────────────────────────────────────────────────────────────────

export type JobStatus = 'QUEUED' | 'RUNNING' | 'DONE' | 'FAILED' | 'CANCELLED';

export interface JobFile {
  name: string;
  format: 'xlsx' | 'pdf';
}

export interface JobProgress {
  percent: number;
  message: string;
  months_total: number;
  months_ok: number;
}

export interface Job {
  id: string;
  owner: string;
  status: JobStatus;
  created_at: string;
  started_at?: string;
  done_at?: string;
  payload: GeneratePayload;
  progress: JobProgress | null;
  files: JobFile[];
  logs: string[];
  error: string | null;
}

/** @deprecated Usar 'Job' diretamente — mantido para compatibilidade temporária. */
export type JobHistoryItem = Job;

// ── Responses ───────────────────────────────────────────────────────────────

export interface JobResponse {
  ok: boolean;
  job: Job;
  message?: string;
  errors?: Record<string, string>;
}

export interface HistoryResponse {
  ok: boolean;
  count: number;
  jobs: Job[];
}

export interface Unidade {
  code: string;
  description: string;
}

export interface UnidadesResponse {
  ok: boolean;
  count: number;
  results: Unidade[];
}

// ── SSE ─────────────────────────────────────────────────────────────────────

export interface SSEMessage {
  type: 'update' | 'error';
  job?: Job;
  message?: string;
}
