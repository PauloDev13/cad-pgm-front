import { BaseEntityResponse } from '../../../shared/model/generic/base-generic.model';

export interface AliasRequestDTO {
  email: string;
}

export interface AliasResponseDTO extends AliasRequestDTO, BaseEntityResponse {}
