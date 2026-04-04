import { Injectable } from '@angular/core';
import { BaseGenericService } from '../../../shared/service/generic/base-generic.service';
import { AliasRequestDTO, AliasResponseDTO } from '../models/alias.model';

@Injectable({
  providedIn: 'root',
})
export class AliasService extends BaseGenericService<AliasRequestDTO, AliasResponseDTO> {
  protected get endpoint(): string {
    return 'alias';
  }
}
