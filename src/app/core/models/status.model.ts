import { BaseEntityResponse } from '../../shared/model/base-generic.model';

export interface StatusRequestDTO {
  descricao: string;
}

export interface StatusResponseDTO extends StatusRequestDTO, BaseEntityResponse {}
