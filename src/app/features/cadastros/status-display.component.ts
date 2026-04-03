import { Component, inject } from '@angular/core';
import { CustomListComponent } from '../../shared/components/custom-list.component';
import { BaseGenericComponent } from '../../shared/components/generic/base-generic.component';
import { ICrudGeneric } from '../../core/models/generic/crud-generic.model';
import { StatusRequestDTO, StatusResponseDTO } from '../../core/models/status.model';
import { StatusService } from '../../core/services/status.service';

@Component({
  selector: 'app-status-display',
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
      mainColumnKey="descricao"
      mainColumnLabel="Descrição"
    />
  `,
})
export default class StatusDisplayComponent extends BaseGenericComponent<StatusResponseDTO> {
  // Injeções
  private readonly statusService = inject(StatusService);

  // Implementação dos métodos obrigatórios herdados do pai
  get entityService(): ICrudGeneric<StatusResponseDTO> {
    return this.statusService;
  }

  get entityTitle(): string {
    return 'Status';
  }

  get inputLabel(): string {
    return 'Status';
  }

  buildPayload(value: string): StatusRequestDTO {
    return { descricao: value };
  }

  getInputValue(item: StatusResponseDTO): string {
    return item.descricao;
  }
}
