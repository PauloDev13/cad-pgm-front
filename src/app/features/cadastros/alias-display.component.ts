import { Component, inject } from '@angular/core';
import { CustomListComponent } from '../../shared/components/custom-list.component';
import { AliasRequestDTO, AliasResponseDTO } from '../../core/models/alias.model';
import { AliasService } from '../../core/services/alias.service';
import { BaseGenericComponent } from '../../shared/components/generic/base-generic.component';
import { ICrudGeneric } from '../../shared/model/crud-generic.model';

@Component({
  selector: 'app-cargo-display',
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
      mainColumnLabel="E-mail"
      mainColumnKey="email"
    />
  `,
})
export default class AliasDisplayComponent extends BaseGenericComponent<AliasResponseDTO> {
  // Injeções
  private readonly aliasService = inject(AliasService);

  // Implementação dos métodos obrigatórios herdados do pai
  get entityService(): ICrudGeneric<AliasResponseDTO> {
    return this.aliasService;
  }

  get entityTitle(): string {
    return 'Alias';
  }

  get inputLabel(): string {
    return 'Email';
  }

  buildPayload(value: string): AliasRequestDTO {
    return { email: value };
  }

  getInputValue(item: AliasResponseDTO): string {
    return item.email;
  }
}
