import { AndarCodigo } from './manutencao-enums.model';

export interface AndarResponseDTO {
  codigo: AndarCodigo;
  rotulo: string;
}

export interface SalaResponseDTO {
  id: number;
  numeroIdentificacao: string;
  andar: AndarCodigo;
  rotuloAndar: string;
  descricao?: string;
  ativo: boolean;
}

/**
 * CATEGORIA MODELO
 */
export type CategoriaDemandaModel = Required<Omit<CategoriaDemandaRequestDTO,
  'ordemExibicao' | 'descricao'>> & {
  nome: string;
  descricao: string;
  ordemExibicao: number;
  ativo: boolean;
}

export interface CategoriaDemandaRequestDTO {
  nome: string;
  descricao?: string;
  ordemExibicao?: number;
  ativo: boolean;
}

export interface CategoriaDemandaResponseDTO {
  id: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
  ordemExibicao?: number;
}

export type TipoServicoModel = Required<Omit<TipoServicoRequestDTO,
  'ordemExibicao' | 'descricao' | 'ativo'>> & {
  nome: string;
  descricao: string;
  ordemExibicao: number;
  ativo: boolean;
}

export interface TipoServicoResponseDTO {
  id: number;
  categoriaId: number;
  categoriaNome: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
  ordemExibicao?: number;
}

export interface TipoServicoRequestDTO {
  categoriaId: number;
  nome: string;
  descricao?: string;
  ordemExibicao?: number;
  ativo?: boolean;
}

/*
  INTERFACE DE PAGINAÇÃO PARA AS LISTAS DE CATEGORIA E TIPO DE SERVIÇO
  Suporta tanto a serialização via DTO Spring Data (com sub-objeto 'page')
  quanto a serialização raiz padrão de PageImpl.
 */
export interface SpringPage<T> {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
  page?: {
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
}
