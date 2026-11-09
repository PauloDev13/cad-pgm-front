import { AndarCodigo, EstadoChamado, EventoHistoricoChamado, PrioridadeChamado } from './manutencao-enums.model';

export interface AberturaChamadoRequestDTO {
  andar: AndarCodigo | null;
  salaId: number | null;
  localDescricao: string;
  categoriaId: number | null;
  subcategoriaId: number | null;
  tipoServicoId: number | null;
  prioridade: PrioridadeChamado;
  prazoConclusao?: string | null;
  movelRelacionado?: string;
  numeroRequisicaoEcidade?: string;
  descricao: string;
}

export interface AtualizarDadosAdministrativosRequestDTO {
  prioridade?: PrioridadeChamado;
  prazoConclusao?: string | null;
  movelRelacionado?: string | null;
  numeroRequisicaoEcidade?: string | null;
}

/**
 * Modelo de estado do formulário para Abertura de Chamado (Signal Forms).
 * Garante que todos os campos controlados tenham valores definidos (null ou string vazia),
 * eliminando 'undefined' e evitando a geração de 'MaybeFieldTree'.
 */
export type AberturaChamadoModel = Required<Omit<AberturaChamadoRequestDTO,
  'prazoConclusao' | 'movelRelacionado' | 'numeroRequisicaoEcidade'>> & {
  prazoConclusao: string | null;
  movelRelacionado: string;
  numeroRequisicaoEcidade: string;
};

/**
 * Representa um servidor/usuário apto a assumir chamados no Almoxarifado (possui role 'almoxarifado').
 * Consumido pelo dropdown de atribuição de responsáveis.
 */
export interface ResponsavelComboResponseDTO {
  id: number;
  nome: string;
  email: string;
}

export interface AtribuicaoChamadoRequestDTO {
  responsavelId: number;
  observacao: string;
}

export interface IniciarAtendimentoRequestDTO {
  observacao: string;
}

export interface ConcluirChamadoRequestDTO {
  observacao: string;
}

export interface CancelarChamadoRequestDTO {
  motivo: string;
}

export interface HistoricoChamadoResponseDTO {
  id: number;
  evento: EventoHistoricoChamado;
  descricaoEvento: string;
  estadoAnterior?: EstadoChamado;
  estadoNovo?: EstadoChamado;
  responsavelAnteriorNome?: string;
  responsavelNovoNome?: string;
  atorNome: string;
  dataHora: string;
  observacao: string | null;
}

export interface ChamadoResumoResponseDTO {
  id: number;
  protocolo: string;
  andar: AndarCodigo;
  rotuloAndar: string;
  localExibicao: string;
  salaId?: number;
  categoriaNome: string;
  tipoServicoNome: string;
  estado: EstadoChamado;
  rotuloEstado: string;
  solicitanteNome: string;
  responsavelNome?: string;
  criadoEm: string;
  atribuidoEm?: string;
  concluidoEm?: string;
}

export interface ChamadoDetalheResponseDTO {
  id: number;
  protocolo: string;
  andar: AndarCodigo;
  rotuloAndar: string;
  salaId?: number;
  salaNome?: string;
  localDescricao?: string;
  categoriaId: number;
  categoriaNome: string;
  subcategoriaId?: number;
  subcategoriaNome?: string;
  tipoServicoId: number;
  tipoServicoNome: string;
  descricaoProblema: string;
  estado: EstadoChamado;
  rotuloEstado: string;
  prioridade?: PrioridadeChamado;
  rotuloPrioridade?: string;
  prazoConclusao?: string;
  movelRelacionado?: string;
  numeroRequisicaoEcidade?: string;
  solicitanteId: number;
  solicitanteNome: string;
  responsavelId?: number;
  responsavelNome?: string;
  criadoEm: string;
  atribuidoEm?: string;
  iniciadoEm?: string;
  concluidoEm?: string;
  canceladoEm?: string;
  motivoCancelamento?: string;
  historico: HistoricoChamadoResponseDTO[];
}

export interface ChamadoFilaQueryParams {
  page: number;
  size: number;
  estado?: EstadoChamado;
  categoriaId?: number;
  tipoServicoId?: number;
  andar?: AndarCodigo;
  salaId?: number;
  responsavelId?: number;
}
