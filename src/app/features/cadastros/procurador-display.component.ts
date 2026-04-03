import { Component, inject } from '@angular/core';
import { CustomListComponent } from '../../shared/components/custom-list.component';
import { ProcuradorRequestDTO, ProcuradorResponseDTO } from '../../core/models/procurador.model';
import { ProcuradorService } from '../../core/services/procurador.service';
import { BaseGenericComponent } from '../../shared/components/generic/base-generic.component';
import { ICrudGeneric } from '../../shared/model/crud-generic.model';

@Component({
  selector: 'app-procurador-display',
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
export default class ProcuradorDisplayComponent extends BaseGenericComponent<ProcuradorResponseDTO> {
  // Injeções
  private readonly procuradorService = inject(ProcuradorService);

  // Implementação dos métodos obrigários herdados do pai
  get entityService(): ICrudGeneric<ProcuradorResponseDTO> {
    return this.procuradorService;
  }

  get entityTitle(): string {
    return 'Procurador';
  }

  get inputLabel(): string {
    return 'Nome';
  }

  buildPayload(value: string): ProcuradorRequestDTO {
    return { nome: value };
  }

  getInputValue(item: ProcuradorResponseDTO): string {
    return item.nome;
  }
}
