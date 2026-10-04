export type TipoFeriado =
  | 'FERIADO_NACIONAL'
  | 'FERIADO_ESTADUAL'
  | 'FERIADO_MUNICIPAL'
  | 'PONTO_FACULTATIVO';

export interface FeriadoRequestDTO {
  data: string; // Formato 'MM-dd' (ex: '04-21')
  nome: string;
  tipo: TipoFeriado;
  ativo?: boolean;
}

export interface FeriadoResponseDTO {
  id: number;
  data: string; // Formato 'MM-dd' (ex: '04-21')
  nome: string;
  tipo: TipoFeriado;
  ativo: boolean;
}

export interface FeriadoStatusPatchDTO {
  ativo: boolean;
}

export interface TipoFeriadoOption {
  value: TipoFeriado;
  label: string;
  badgeClass: string;
}

export const TIPOS_FERIADO: TipoFeriadoOption[] = [
  {
    value: 'FERIADO_NACIONAL',
    label: 'Feriado Nacional',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  {
    value: 'FERIADO_ESTADUAL',
    label: 'Feriado Estadual',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  {
    value: 'FERIADO_MUNICIPAL',
    label: 'Feriado Municipal',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300'
  },
  {
    value: 'PONTO_FACULTATIVO',
    label: 'Ponto Facultativo',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300'
  }
];
