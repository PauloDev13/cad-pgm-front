import { AndarCodigo } from './manutencao-enums.model';

/**
 * ANDAR MODELO
 */
export interface AndarResponseDTO {
  codigo: AndarCodigo;
  rotulo: string;
}

/**
 * SALA MODELO
 */
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

/**
 * SUBCATEGORIA MODELO
 */

export interface SubcategoriaResponseDTO {
  id: number;
  categoriaId: number;
  categoriaNome: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
  ordemExibicao?: number;
  prazoEstimadoDias?: number;
  requerTombamento: boolean;
}

export interface SubcategoriaRequestDTO {
  categoriaId: number;
  nome: string;
  descricao?: string;
  ordemExibicao?: number;
  ativo?: boolean;
  prazoEstimadoDias?: number;
  requerTombamento?: boolean;
}

export type SubcategoriaModel = Required<Omit<
  SubcategoriaRequestDTO, 'descricao' | 'ordemExibicao' | 'prazoEstimadoDias'>
> & {
  descricao: string;
  ordemExibicao: number;
  prazoEstimadoDias: number;
  ativo: boolean;
  requerTombamento: boolean;
};

export interface SubcategoriaDialogData {
  subcategoria?: SubcategoriaResponseDTO;
  categoriaIdSelecionada?: number;
}

/**
 * Parâmetros de consulta para Subcategorias Paginadas
 */
export interface SubcategoriaFiltroParams {
  categoriaId?: number | null;
  ativo?: boolean | null;
  page: number;
  size: number;
}

/**
 * TIPOS SERVIÇO MODELO
 */

export interface TipoServicoResponseDTO {
  id: number;
  subcategoriaId: number;
  categoriaNome: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
  ordemExibicao?: number;
}

export interface TipoServicoRequestDTO {
  subcategoriaId: number;
  nome: string;
  descricao?: string;
  ordemExibicao?: number;
  ativo?: boolean;
}

export type TipoServicoModel = Required<Omit<TipoServicoRequestDTO,
  'ordemExibicao' | 'descricao' | 'ativo'>> & {
  nome: string;
  descricao: string;
  ordemExibicao: number;
  ativo: boolean;
}


export interface TipoServicoDialogData {
  tipoServico?: TipoServicoResponseDTO;
  subcategoriaIdSelecionada?: number;
}

/**
 * Parâmetros de consulta para Tipos de Serviço Paginados
 */
export interface TipoServicoFiltroParams {
  subcategoriaId?: number | null;
  categoriaId?: number | null;
  ativo?: boolean | null;
  page: number;
  size: number;
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

