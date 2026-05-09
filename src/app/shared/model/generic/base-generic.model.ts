// O que o Pai manda para o Modal
export interface SingleInputDialogData {
  id?: number; // O ID se for edição
  title: string; // Ex: 'Cargo' ou 'Status'
  inputLabel: string; // Ex: 'Nome do Cargo' ou 'Descrição'
  inputValue: string; // O valor atual se for edição (ex: 'Analista') ou '' se for novo
}

// O que o Modal devolve para o Pai
export interface SingleInputModalResult {
  id?: number;
  value: string; // O texto puro validado que o usuário digitou!
}

// A Base de qualquer entidade que volta do Banco de Dados
export interface BaseEntityResponse {
  id: number;
}

// O padrão que se repete em Cargo, Setor, Vinculo, etc.
export interface NomeableRequest {
  nome: string;
}

// Junta o ID com o Nome (Herança múltipla do TypeScript)
export interface NomeableResponse extends BaseEntityResponse, NomeableRequest {
}
