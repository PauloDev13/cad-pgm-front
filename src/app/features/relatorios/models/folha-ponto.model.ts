export interface FolhaPontoServidorDTO {
  nome: string;
  vinculo: string;
  tipoAtividade: string | null; // Pode vir nulo conforme aviso do backend
}

export interface FolhaPontoSetorDTO {
  nomeSetor: string;
  totalServidores: number;
  servidores: FolhaPontoServidorDTO[];
}
