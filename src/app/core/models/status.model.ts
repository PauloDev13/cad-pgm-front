import { BaseEntityResponse } from '../../shared/model/BaseGeneric.model';

export interface StatusRequestDTO {
  descricao: string;
}

export interface StatusResponseDTO extends StatusRequestDTO, BaseEntityResponse {}
