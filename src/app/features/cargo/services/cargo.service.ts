import { Injectable } from '@angular/core';
import { CargoRequestDTO, CargoResponseDTO } from '../models/cargo.model';
import { BaseGenericService } from '../../../shared/service/generic/base-generic.service';

@Injectable({
  providedIn: 'root',
})
export class CargoService extends BaseGenericService<CargoRequestDTO, CargoResponseDTO> {
  protected get endpoint(): string {
    return 'cargos';
  }
}
