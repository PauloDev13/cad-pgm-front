import { Component, inject } from '@angular/core';
import { SetorService } from '../services/setor.service';
import { SetorRequestDTO, SetorResponseDTO } from '../models/setor.model';
import { CustomListComponent } from '../../../shared/components/custom-list/custom-list.component';
import { BaseGenericComponent } from '../../../shared/components/generic/base-generic.component';
import { ICrudGeneric } from '../../../shared/model/generic/crud-generic.model';

@Component({
  selector: 'app-setor-display',
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
export default class SetorDisplayPage extends BaseGenericComponent<SetorResponseDTO> {
  // Injeções
  private readonly setorService = inject(SetorService);

  // Implementação dos métodos obrigários herdados do pai
  get entityService(): ICrudGeneric<SetorResponseDTO> {
    return this.setorService;
  }

  get entityTitle(): string {
    return 'Setor';
  }

  get inputLabel(): string {
    return 'Setor';
  }

  buildPayload(value: string): SetorRequestDTO {
    return { nome: value };
  }

  getInputValue(item: SetorResponseDTO): string {
    return item.nome;
  }
}
