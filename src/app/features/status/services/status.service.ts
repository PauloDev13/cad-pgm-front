import { inject, Injectable } from '@angular/core';
import { BaseGenericService } from '../../../shared/service/generic/base-generic.service';
import { StatusRequestDTO, StatusResponseDTO } from '../models/status.model';
import { DominioService } from '../../servidor/services/dominio.service';

@Injectable({
  providedIn: 'root'
})
export class StatusService extends BaseGenericService<StatusRequestDTO, StatusResponseDTO> {
  private readonly dominioService = inject(DominioService);

  // Implementa o método obrigatório do pai
  protected get endpoint(): string {
    return 'status';
  }

  // Toda vez que este serviço der um POST/PUT com sucesso, isso aqui roda sozinho!
  protected override onDataMutated() {
    // Mandamos limpar APENAS a gaveta de cargos
    this.dominioService.clearCache('status');
  }
}
