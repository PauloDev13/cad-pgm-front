import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-deleted-filter',
  imports: [CommonModule, MatFormFieldModule, MatSelectModule, MatInputModule, MatIconModule],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 bg-white md:bg-gray-50 p-2 md:p-4
             rounded-xl shadow-sm border border-gray-200"
    >
      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
        <mat-label>Filtrar por</mat-label>
        <mat-select
          [value]="searchType()"
          (selectionChange)="searchTypeChange.emit($event.value)"
        >
          <mat-option value="NOME">NOME</mat-option>
          <mat-option value="CPF">CPF</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field
        appearance="outline"
        subscriptSizing="dynamic"
        class="w-full"
      >
        <mat-label>Digite para buscar...</mat-label>
        <input
          matInput
          [value]="searchTerm()"
          (input)="searchInput.emit($event)"
          [placeholder]="searchType() === 'CPF'
                ? 'Apenas dígitos numéricos'
                : 'Ex: João Morais'"
        />
        <mat-icon matIconPrefix class="text-gray-500">search</mat-icon>
      </mat-form-field>
    </div>
  `
})
export class DeletedFilterComponent {
  // INPUTS: O que o Pai vai mandar para cá
  searchType = input<'CPF' | 'NOME'>('NOME');
  searchTerm = input<string>('');

  // OUTPUTS: O que vamos avisar ao Pai
  searchTypeChange = output<'CPF' | 'NOME'>();
  searchInput = output<Event>();
}
