// Interface para o relatório da folha de ponto
export interface FolhaPontoDTO {
  id: number;
  nome: string;
  setor: string;
  vinculo: string;
  formaTrabalho: 'PRESENCIAL' | 'HIBRIDO' | 'REMOTO';
}
