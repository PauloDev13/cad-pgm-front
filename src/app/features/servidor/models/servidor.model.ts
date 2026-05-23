// Tipagem para o Enum atividade
export type TipoAtividade = 'PRESENCIAL' | 'REMOTO' | 'HIBRIDO' | null;

// Tipagem para consultar as roles do usuário e evitar erros de digitação
export type UserRole = 'admin' | 'rh' | 'guest';

// Interfaces auxiliares de Resposta
export interface BaseEntityDTO {
  id: number;
  nome: string;
  descricao?: string; // Para status_servidor
  email?: string; // Para alias_servidor
}

// DTO do envio (request)
export interface ServidorRequestDTO {
  nome: string;
  matricula: string;
  cpf: string;
  dataNascimento?: string; // YYYY-MM-DD
  genero?: string;
  telefone?: string;
  emailPessoal: string;
  emailInstitucional?: string;
  endereco?: string;
  filiacao?: string;
  tipoAtividade: TipoAtividade;
  cargoId: number;
  setorId: number;
  lotacaoId: number;
  statusId: number;
  vinculoId: number;
  sistemaIds?: number[];
  aliasIds?: number[];
  procuradorIds?: number[];
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
  excluded: boolean;
  excludedDate: string;
  photoPath: string,
  tipoAtividade: TipoAtividade;
  cargo?: BaseEntityDTO;
  lotacao?: BaseEntityDTO;
  setor?: BaseEntityDTO;
  status?: BaseEntityDTO;
  vinculo?: BaseEntityDTO;
  sistemas?: BaseEntityDTO[];
  aliases?: BaseEntityDTO[];
  procuradores?: BaseEntityDTO[];
}
