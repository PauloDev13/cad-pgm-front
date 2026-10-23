export interface ItemAgrupadoDTO {
  chave: string;
  quantidade: number;
}
export interface DashboardManutencaoResponseDTO {
  totalAbertos: number;
  totalConcluidos: number;
  totalCancelados: number;
  tempoMedioRespostaHoras?: number;
  qtdChamadosTempoResposta: number;
  tempoMedioResolucaoHoras?: number;
  qtdChamadosTempoResolucao: number;
  volumePorTipoServico: ItemAgrupadoDTO[];
  volumePorCategoria: ItemAgrupadoDTO[];
  volumePorEstado: ItemAgrupadoDTO[];
}
