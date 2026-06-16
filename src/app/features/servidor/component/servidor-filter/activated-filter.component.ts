import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { BaseEntityDTO } from '../../models/servidor.model';
import { MatButtonModule } from '@angular/material/button';
import { AutocompleteComponent } from '../../../../shared/components/autocomplete/autocomplete.component';


@Component({
  selector: 'app-servidor-filter',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    AutocompleteComponent
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4 bg-white md:bg-gray-50 pt-3 px-3
             pb-0 md:pt-4 md:px-4 md:pb-0 rounded-xl border border-gray-200 items-start">

      <button
        mat-stroked-button
        (click)="cleanFilters.emit($event)"
        class="md:col-span-1 w-full sm:w-auto !border-blue-600 !text-blue-600 !transition-transform
               duration-300 hover:!scale-105 order-3 sm:order-1">
        Limpar
        <mat-icon>delete_sweep</mat-icon>
      </button>

      <div class="md:col-span-2 w-full">
        <app-list-autocomplete
          class="md:col-span-6"
          [data]="statusList()"
          label="status"
          placeholder="Pesquisar por status..."
          displayKey="descricao"
          [selectedId]="selectedStatusId()"
          (selectedIdChange)="statusChange.emit($event)" />
      </div>

      <div class="md:col-span-2 w-full">
        <app-list-autocomplete
          class="md:col-span-6"
          [data]="cargoList()"
          label="Cargo"
          placeholder="Pesquisar por cargo..."
          [selectedId]="selectedCargoId()"
          (selectedIdChange)="cargoChange.emit($event)" />
      </div>

      <div class="md:col-span-4 w-full">
        <app-list-autocomplete
          class="md:col-span-6"
          [data]="setorList()"
          label="Setor"
          placeholder="Pesquisar por setor..."
          [selectedId]="selectedSetorId()"
          (selectedIdChange)="setorChange.emit($event)" />
      </div>

      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="md:col-span-1 w-full">
        <mat-label>Filtro por</mat-label>
        <mat-select [value]="searchType()" (selectionChange)="searchTypeChange.emit($event.value)">
          <mat-option value="NOME">NOME</mat-option>
          <mat-option value="CPF">CPF</mat-option>
          <mat-option value="MATRICULA">MATRÍCULA</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="md:col-span-2 w-full">
        <mat-label>Digite para buscar...</mat-label>
        <input matInput [value]="searchTerm()" (input)="searchInput.emit($event)"
               [placeholder]="searchType() === 'CPF'
               ? 'Apenas dígitos'
               : searchType() === 'NOME'
               ? 'Ex: João Morais'
               : 'Ex: T0001'"
        />
        <mat-icon matIconPrefix class="text-gray-500">search</mat-icon>
      </mat-form-field>
    </div>
  `
})
export class ActivatedFilterComponent {
  // INPUTS: O que o Pai vai mandar para cá
  statusList = input.required<BaseEntityDTO[]>();
  selectedStatusId = model<number | null>(null);

  cargoList = input.required<BaseEntityDTO[]>();
  selectedCargoId = input<number | null>(null);

  setorList = input.required<BaseEntityDTO[]>();
  selectedSetorId = input<number | null>(null);

  searchType = input<'CPF' | 'MATRICULA' | 'NOME'>('NOME');
  searchTerm = input<string>('');

  // OUTPUTS: O que vamos avisar ao Pai
  statusChange = output<number | null>();
  cargoChange = output<number | null>();
  setorChange = output<number | null>();
  searchTypeChange = output<'CPF' | 'MATRICULA' | 'NOME'>();
  searchInput = output<Event>();
  cleanFilters = output<Event>();
}
