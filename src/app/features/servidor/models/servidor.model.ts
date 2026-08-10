// Tipagem para o Enum atividade
export type TipoAtividade = 'PRESENCIAL' | 'REMOTO' | 'HIBRIDO' | null;

// Tipagem para as abas do formulário de cadastro de servidores
export type TabId = 'DADOS_PESSOAIS' | 'VINCULOS_PERMISSOES' | 'DOCUMENTOS'

// Tipagem para consultar as roles do usuário e evitar erros de digitação
export type UserRole = 'admin' | 'rh' | 'guest';

// Tipagem para exclusão de servidor com os atributos ID e Nome
export type TServidorDelete = Pick<ServidorResponseDTO, 'id' | 'nome'>

// Interface para a pesquisa dinâmica de servidores Ativos
export interface IServidorQueryParams {
  page: number;
  size: number;
  cpf?: string;
  matricula?: string;
  nome?: string;
  statusId?: number | null;
  cargoId?: number | null;
  setorId?: number | null;
}

// Interface para pesquisa dinâmica de servidores Desligados
export interface IServidorExcludedQueryParams {
  page: number;
  size: number;
  term?: string;
}

// Interfaces  de Resposta das entidades de domínio
export interface BaseEntityDTO {
  id: number;
  nome: string;
  descricao?: string; // Para status_servidor
  email?: string; // Para alias_servidor
}

// Servidor DTO do envio (request)
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

// Servidor DTO de Recebimento (Response)
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
