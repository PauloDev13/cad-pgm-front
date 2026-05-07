export interface AuditResponseDTO {
  id: number;
  username: string;
  dateHourAction: string; // Virá como ISO "2026-05-05T14:45:22"
  typeAction: 'INSERT' | 'UPDATE' | 'DELETE';
  affectedEntity: string;
  idAffectedRecord: string;
  details: string;
}

export interface AuditForm {
  username: string;
  typeAction: string;
  startDate: Date | null;
  endDate: Date | null;
}
