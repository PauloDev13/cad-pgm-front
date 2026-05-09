import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SetorService } from '../services/setor.service';
import { SetorRequestDTO, SetorResponseDTO } from '../models/setor.model';
import { CustomListComponent } from '../../../shared/components/custom-list/custom-list.component';
import { BaseGenericDirective } from '../../../shared/directives/base-generic/base-generic.directive';
import { ICrudGeneric } from '../../../shared/model/generic/crud-generic.model';

@Component({
  selector: 'app-setor-display',
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
export default class SetorDisplayPage extends BaseGenericDirective<SetorResponseDTO> {
  // Injeções
  private readonly setorService = inject(SetorService);

  // Implementação dos métodos obrigatórios herdados do pai
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
