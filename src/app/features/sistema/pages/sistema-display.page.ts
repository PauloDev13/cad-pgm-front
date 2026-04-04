import { Component, inject } from '@angular/core';
import { CustomListComponent } from '../../../shared/components/custom-list/custom-list.component';
import { SistemaRequestDTO, SistemaResponseDTO } from '../models/sistema.model';
import { BaseGenericComponent } from '../../../shared/components/generic/base-generic.component';
import { ICrudGeneric } from '../../../shared/model/generic/crud-generic.model';
import { SistemaService } from '../services/sistema.service';

@Component({
  selector: 'app-sistema-display',
  imports: [CustomListComponent],
  standalone: true,
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
  `,
})
export default class SistemaDisplayPage extends BaseGenericComponent<SistemaResponseDTO> {
  // Injeções
  private readonly sistemaService = inject(SistemaService);

  // Implementação dos métodos obrigatórios herdados do pai
  get entityService(): ICrudGeneric<SistemaResponseDTO> {
    return this.sistemaService;
  }

  get entityTitle(): string {
    return 'Sistema';
  }

  get inputLabel(): string {
    return 'Nome';
  }

  buildPayload(value: string): SistemaRequestDTO {
    return { nome: value };
  }

  getInputValue(item: SistemaResponseDTO): string {
    return item.nome;
  }
}
