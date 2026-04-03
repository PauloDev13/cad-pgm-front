import { Injectable } from '@angular/core';
import { BaseGenericService } from '../../shared/service/generic/BaseGeneric.service';
import { StatusRequestDTO, StatusResponseDTO } from '../models/status.model';

@Injectable({
  providedIn: 'root',
})
export class StatusService extends BaseGenericService<StatusRequestDTO, StatusResponseDTO> {
  // Implementa o método obrigatório do pai
  protected get endpoint(): string {
    return 'status';
  }
}
