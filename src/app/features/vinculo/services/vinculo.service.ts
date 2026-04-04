import { Injectable } from '@angular/core';
import { BaseGenericService } from '../../../shared/service/generic/base-generic.service';
import { VinculoRequestDTO, VinculoResponseDTO } from '../models/vinculo.model';

@Injectable({
  providedIn: 'root',
})
export class VinculoService extends BaseGenericService<VinculoRequestDTO, VinculoResponseDTO> {
  protected get endpoint(): string {
    return 'vinculos';
  }
}
