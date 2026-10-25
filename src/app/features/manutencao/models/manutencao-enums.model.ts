export enum AndarCodigo {
  TERREO = 'TERREO',
  PRIMEIRO_ANDAR = 'PRIMEIRO_ANDAR'
}

export const ANDAR_LABELS: Record<AndarCodigo, string> = {
  [AndarCodigo.TERREO]: 'Térreo',
  [AndarCodigo.PRIMEIRO_ANDAR]: 'Primeiro andar'
};

export enum EstadoChamado {
  ABERTO = 'ABERTO',
  ATRIBUIDO = 'ATRIBUIDO',
  EM_ATENDIMENTO = 'EM_ATENDIMENTO',
  CONCLUIDO = 'CONCLUIDO',
  CANCELADO = 'CANCELADO'
}

export const ESTADO_CHAMADO_LABELS: Record<EstadoChamado, string> = {
  [EstadoChamado.ABERTO]: 'Aberto',
  [EstadoChamado.ATRIBUIDO]: 'Atribuído',
  [EstadoChamado.EM_ATENDIMENTO]: 'Em Atendimento',
  [EstadoChamado.CONCLUIDO]: 'Concluído',
  [EstadoChamado.CANCELADO]: 'Cancelado'
};

export enum EventoHistoricoChamado {
  CRIACAO = 'CRIACAO',
  ATRIBUICAO = 'ATRIBUICAO',
  REATRIBUICAO = 'REATRIBUICAO',
  INICIO_ATENDIMENTO = 'INICIO_ATENDIMENTO',
  CONCLUSAO = 'CONCLUSAO',
  CANCELAMENTO = 'CANCELAMENTO'
}

export enum ManutencaoRole {
  MANUTENCAO = 'manutencao',
  ALMOXARIFADO = 'almoxarifado',
  TRAMITADOR = 'tramitador',
  ADMIN = 'admin'
}
