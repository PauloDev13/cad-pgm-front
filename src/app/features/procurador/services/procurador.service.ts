import { inject, Injectable } from '@angular/core';
import { CargoRequestDTO, CargoResponseDTO } from '../../cargo/models/cargo.model';
import { BaseGenericService } from '../../../shared/service/generic/base-generic.service';
import { DominioService } from '../../servidor/services/dominio.service';

@Injectable({
  providedIn: 'root'
})
export class ProcuradorService extends BaseGenericService<CargoRequestDTO, CargoResponseDTO> {
  private readonly dominioService = inject(DominioService);

  protected get endpoint(): string {
    return 'procuradores';
  }

  // Toda vez que este serviço der um POST/PUT com sucesso, isso aqui roda sozinho!
  protected override onDataMutated() {
    // Mandamos limpar APENAS a gaveta de cargos
    this.dominioService.clearCache('procurador');
  }
}
