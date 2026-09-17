import { Injectable } from '@angular/core';
import { ProcuradorRequestDTO, ProcuradorResponseDTO } from '../models/procurador.model';
import { BaseGenericService } from '../../../shared/service/generic/base-generic.service';

@Injectable({
  providedIn: 'root'
})
export class ProcuradorService extends BaseGenericService<ProcuradorRequestDTO, ProcuradorResponseDTO> {

  protected get endpoint(): string {
    return 'procuradores';
  }
}