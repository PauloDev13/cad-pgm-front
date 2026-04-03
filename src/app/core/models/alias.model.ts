import { BaseEntityResponse } from '../../shared/model/BaseGeneric.model';

export interface AliasRequestDTO {
  email: string;
}

export interface AliasResponseDTO extends AliasRequestDTO, BaseEntityResponse {}
