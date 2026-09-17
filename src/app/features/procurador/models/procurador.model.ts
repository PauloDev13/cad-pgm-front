import { BaseEntityResponse } from '../../../shared/model/generic/base-generic.model';

export type TipoCertificado = 'A1' | 'A3';

export interface ProcuradorRequestDTO {
  nome: string;
  tipoCertificado: TipoCertificado;
  dataExpedicao: string; // Formato ISO 8601: "YYYY-MM-DDTHH:mm:ss"
}

export interface ProcuradorResponseDTO extends BaseEntityResponse {
  nome: string;
  tipoCertificado: TipoCertificado;
  dataExpedicao: string; // Formato ISO 8601: "YYYY-MM-DDTHH:mm:ss"
  dataExpiracao: string; // Formato ISO 8601: "YYYY-MM-DDTHH:mm:ss" (calculado no backend)
}

export interface TipoCertificadoOption {
  value: TipoCertificado;
  label: string;
  validadeAnos: number;
  descricao: string;
}

export const TIPOS_CERTIFICADO: TipoCertificadoOption[] = [
  { value: 'A1', label: 'Certificado A1', validadeAnos: 1, descricao: 'Validade de 1 ano (Software / Arquivo .pfx)' },
  { value: 'A3', label: 'Certificado A3', validadeAnos: 3, descricao: 'Validade de 3 anos (Hardware / Token / Smartcard)' }
];

