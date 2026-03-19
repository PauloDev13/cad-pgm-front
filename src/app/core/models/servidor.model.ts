// DTO do envio (request)
export interface ServidorRequestDTO {
  nome: string;
  matricula: string;
  cpf: string;
  dataNascimento?: string; // YYYY-MM-DD
  genero?: string;
  telefone?: string;
  emailPessoal?: string;
  emailInstitucional?: string;
  endereco?: string;
  filiacao?: string;
  cargoId: number;
  setorId: number;
  lotacaoId: number;
  statusId: number;
  vinculoId: number;
  sistemaIds?: number[];
  aliasIds?: number[];
  procuraIds?: number[];
}

// Interfaces auxiliares de Resposta
export interface BaseEntityDTO {
  id: number;
  nome?: string;
  descricao?: string; // Para status_servidor
}

// DTO de Recebimento (Response)
export interface ServidorResponseDTO {
  id: number;
  nome: string;
  matricula: string;
  cpf: string;
  dataNascimento?: string;
  genero?: string;
  telefone?: string;
  emailPessoal?: string;
  emailInstitucional?: string;
  endereco?: string;
  filiacao?: string;
  cargo?: BaseEntityDTO;
  lotacao?: BaseEntityDTO;
  setor?: BaseEntityDTO;
  status?: BaseEntityDTO;
  vinculo?: BaseEntityDTO;
  sistemas?: BaseEntityDTO[];
  aliases?: BaseEntityDTO[];
  procuradores?: BaseEntityDTO[];
}
