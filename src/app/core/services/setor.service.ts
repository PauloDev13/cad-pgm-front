import { Injectable } from '@angular/core';
import { SetorRequestDTO, SetorResponseDTO } from '../models/setor.model';
import { BaseGenericService } from '../../shared/service/generic/base-generic.service';

@Injectable({
  providedIn: 'root',
})
export class SetorService extends BaseGenericService<SetorRequestDTO, SetorResponseDTO> {
  protected get endpoint(): string {
    return 'setores';
  }
}
