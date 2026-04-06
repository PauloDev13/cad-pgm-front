import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CustomListComponent } from '../../../shared/components/custom-list/custom-list.component';
import { BaseGenericComponent } from '../../../shared/components/generic/base-generic.component';
import { ICrudGeneric } from '../../../shared/model/generic/crud-generic.model';
import { VinculoRequestDTO, VinculoResponseDTO } from '../models/vinculo.model';
import { VinculoService } from '../services/vinculo.service';

@Component({
  selector: 'app-vinculo-display',
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
export default class VinculoDisplayPage extends BaseGenericComponent<VinculoResponseDTO> {
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
