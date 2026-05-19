import { inject, Injectable } from '@angular/core';
import { BaseGenericService } from '../../../shared/service/generic/base-generic.service';
import { AliasRequestDTO, AliasResponseDTO } from '../models/alias.model';
import { DominioService } from '../../servidor/services/dominio.service';

@Injectable({
  providedIn: 'root'
})
export class AliasService extends BaseGenericService<AliasRequestDTO, AliasResponseDTO> {
  private readonly dominioService = inject(DominioService);

  protected get endpoint(): string {
    return 'alias';
  }

  // Toda vez que este serviço der um POST/PUT com sucesso, isso aqui roda sozinho!
  protected override onDataMutated() {
    // Mandamos limpar APENAS a gaveta de cargos
    this.dominioService.clearCache('alias');
  }
}
