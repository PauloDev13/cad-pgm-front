import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CustomListComponent } from '../../../shared/components/custom-list/custom-list.component';
import { CargoRequestDTO, CargoResponseDTO } from '../models/cargo.model';
import { CargoService } from '../services/cargo.service';
import { BaseGenericDirective } from '../../../shared/directives/base-generic/base-generic.directive';
import { ICrudGeneric } from '../../../shared/model/generic/crud-generic.model';

@Component({
  selector: 'app-cargo-display',
  imports: [CustomListComponent],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-custom-list
      [title]="entityTitle"
      [data]="dataList()"
      [pageSize]="pageSize()"
      [currentPage]="currentPage()"
      [totalElements]="totalElements()"
      [isLoading]="isLoading()"
      (onAdd)="openModalNew()"
      (onEdit)="openModalEdit($event)"
      (onDelete)="delete($event)"
      (onPageChange)="handlePageEvent($event)"
      (onSearch)="handleSearch($event)"
    />
  `
})
export default class CargoDisplayPage extends BaseGenericDirective<CargoResponseDTO> {
  // Injeções
  private readonly cargoService = inject(CargoService);

  // Implementação dos métodos obrigatórios herdados do pai
  get entityService(): ICrudGeneric<CargoResponseDTO> {
    return this.cargoService;
  }

  get entityTitle(): string {
    return 'Cargo';
  }

  get inputLabel(): string {
    return 'Nome';
  }

  buildPayload(value: string): CargoRequestDTO {
    return { nome: value };
  }

  getInputValue(item: CargoResponseDTO): string {
    return item.nome;
  }
}
