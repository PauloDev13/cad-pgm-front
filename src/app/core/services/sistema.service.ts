import { Injectable } from '@angular/core';
import { BaseGenericService } from '../../shared/service/generic/BaseGeneric.service';
import { SistemaRequestDTO, SistemaResponseDTO } from '../models/sistema.model';

@Injectable({
  providedIn: 'root',
})
export class SistemaService extends BaseGenericService<SistemaRequestDTO, SistemaResponseDTO> {
  protected get endpoint(): string {
    return 'sistemas';
  }
}
