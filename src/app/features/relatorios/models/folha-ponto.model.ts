export interface FolhaPontoServidorDTO {
  nome: string;
  vinculo: string;
  tipoAtividade: string | null; // Pode vir nulo conforme aviso do backend
}

export interface FolhaPontoSetorDTO {
  idSetor?: number;
  nomeSetor: string;
  totalServidores: number;
  servidores: FolhaPontoServidorDTO[];
}
