import { AndarCodigo, EstadoChamado, EventoHistoricoChamado } from './manutencao-enums.model';

export interface AberturaChamadoRequestDTO {
  andar: AndarCodigo;
  salaId?: number | null;
  localDescricao?: string | null;
  categoriaId: number;
  tipoServicoId: number;
  descricao: string;
}
export interface AtribuicaoChamadoRequestDTO {
  responsavelId: number;
  observacao?: string;
}
export interface IniciarAtendimentoRequestDTO {
  observacao?: string;
}
export interface ConcluirChamadoRequestDTO {
  observacao?: string;
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
  observacao?: string;
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
  tipoServicoId: number;
  tipoServicoNome: string;
  descricaoProblema: string;
  estado: EstadoChamado;
  rotuloEstado: string;
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
