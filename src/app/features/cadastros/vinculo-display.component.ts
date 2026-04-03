import { Component, inject } from '@angular/core';
import { CustomListComponent } from '../../shared/components/custom-list.component';
import { BaseGenericComponent } from '../../shared/components/generic/base-generic.component';
import { ICrudGeneric } from '../../core/models/generic/crud-generic.model';
import { VinculoRequestDTO, VinculoResponseDTO } from '../../core/models/vinculo.model';
import { VinculoService } from '../../core/services/vinculo.service';

@Component({
  selector: 'app-vinculo-display',
  imports: [CustomListComponent],
  standalone: true,
  template: `
    <app-custom-list
      [title]="entityTitle"
      [data]="dataList()"
      [pageSize]="pageSize()"
      [currentPage]="currentPage()"
      [totalElements]="totalElements()"
      (onAdd)="openModalNew()"
      (onEdit)="openModalEdit($event)"
      (onDelete)="delete($event)"
      (onPageChange)="handlePageEvent($event)"
      (onSearch)="handleSearch($event)"
    />
  `,
})
export default class VinculoDisplayComponent extends BaseGenericComponent<VinculoResponseDTO> {
  // Injeções
  private readonly vinculoService = inject(VinculoService);

  // Implementação dos métodos obrigatórios herdados do pai
  get entityService(): ICrudGeneric<VinculoResponseDTO> {
    return this.vinculoService;
  }

  get entityTitle(): string {
    return 'Vínculo';
  }

  get inputLabel(): string {
    return 'Vínculo';
  }

  buildPayload(value: string): VinculoRequestDTO {
    return { nome: value };
  }

  getInputValue(item: VinculoResponseDTO): string {
    return item.nome;
  }
}
