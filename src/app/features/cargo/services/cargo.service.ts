import { inject, Injectable } from '@angular/core';
import { CargoRequestDTO, CargoResponseDTO } from '../models/cargo.model';
import { BaseGenericService } from '../../../shared/service/generic/base-generic.service';
import { DominioService } from '../../servidor/services/dominio.service';

@Injectable({
  providedIn: 'root'
})
export class CargoService extends BaseGenericService<CargoRequestDTO, CargoResponseDTO> {
  private readonly dominioService = inject(DominioService);

  protected get endpoint(): string {
    return 'cargos';
  }

  // Toda vez que este serviço der um POST/PUT com sucesso, isso aqui roda sozinho!
  protected override onDataMutated() {
    // Mandamos limpar APENAS a gaveta de cargos
    this.dominioService.clearCache('cargo');
  }
}
