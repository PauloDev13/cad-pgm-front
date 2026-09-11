export interface ServidorVinculo {
  nomeServidor: string;
  nomeSetor: string;
}

export interface ProcuradorVinculoResponse {
  nomeProcurador: string;
  servidores: ServidorVinculo[];
}

export interface FiltroCertificadosDTO {
  procuradores: string[];
}
