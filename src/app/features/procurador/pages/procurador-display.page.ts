import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CustomListComponent } from '../../../shared/components/custom-list/custom-list.component';
import { ProcuradorRequestDTO, ProcuradorResponseDTO } from '../models/procurador.model';
import { ProcuradorService } from '../services/procurador.service';
import { BaseGenericComponent } from '../../../shared/components/generic/base-generic.component';
import { ICrudGeneric } from '../../../shared/model/generic/crud-generic.model';

@Component({
  selector: 'app-procurador-display',
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
  `,
})
export default class ProcuradorDisplayPage extends BaseGenericComponent<ProcuradorResponseDTO> {
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
