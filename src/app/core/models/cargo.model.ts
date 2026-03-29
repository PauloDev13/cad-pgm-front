// DTO do envio (request)
import { BaseEntityDTO } from './servidor.model';

export interface CargoRequestDTO {
  nome: string;
  descricao?: string; // Para status_servidor
  email?: string; // Para alias_servidor
}

// DTO de Recebimento (Response)
export interface CargoResponseDTO {
  id: number;
  nome: string;
  descricao?: string; // Para status_servidor
  email?: string; // Para alias_servidor
}

export interface SaveRequest {
  id?: number;
  payload: CargoRequestDTO;
}

// Tipagem do que o Dialog espera receber quando for aberto
export interface GenericDialogData {
  title: string;
  element: BaseEntityDTO; // Se vier preenchido, é Edição. Se vier vazio, é Cadastro Novo.
}
