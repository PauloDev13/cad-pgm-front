import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { BaseEntityDTO } from '../../models/servidor.model';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-servidor-filter',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4 bg-white md:bg-gray-50 p-2 md:p-4
             rounded-xl border border-gray-200"
    >
      <button
        mat-stroked-button
        (click)="cleanFilters.emit($event)"
        class="md:col-span-1 w-full sm:w-auto !border-blue-600 !text-blue-600
              !transition-transform duration-300 hover:!scale-105 order-3 sm:order-1">
        Limpar
        <mat-icon>delete_sweep</mat-icon>
      </button>

      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="md:col-span-2">
        <mat-label>Filtrar por Status</mat-label>
        <mat-select
          [value]="selectedStatusId()"
          (selectionChange)="statusChange.emit($event.value)"
        >
          <mat-option [value]="null">Todos os Status</mat-option>
          @for (status of statusList(); track status.id) {
            <mat-option [value]="status.id">{{ status.descricao }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="md:col-span-2 w-full">
        <mat-label>Filtrar por Cargo</mat-label>
        <mat-select
          [value]="selectedCargoId()"
          (selectionChange)="cargoChange.emit($event.value)"
        >
          <mat-option [value]="null">Todos os Status</mat-option>
          @for (cargo of cargoList(); track cargo.id) {
            <mat-option [value]="cargo.id">{{ cargo.nome }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="md:col-span-4 w-full">
        <mat-label>Filtrar por Setor</mat-label>
        <mat-select
          [value]="selectedSetorId()"
          (selectionChange)="setorChange.emit($event.value)"
        >
          <mat-option [value]="null">Todos os Status</mat-option>
          @for (setor of setorList(); track setor.id) {
            <mat-option [value]="setor.id">{{ setor.nome }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="md:col-span-1 w-full">
        <mat-label>Filtrar por</mat-label>
        <mat-select
          [value]="searchType()"
          (selectionChange)="searchTypeChange.emit($event.value)"
        >
          <mat-option value="NOME">NOME</mat-option>
          <mat-option value="CPF">CPF</mat-option>
          <mat-option value="MATRICULA">MATRÍCULA</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field
        appearance="outline"
        subscriptSizing="dynamic"
        class="md:col-span-2 w-full"
      >
        <mat-label>Digite para buscar...</mat-label>
        <input
          matInput
          [value]="searchTerm()"
          (input)="searchInput.emit($event)"
          [placeholder]="
              searchType() === 'CPF'
                ? 'Apenas dígitos numéricos'
                : searchType() === 'NOME'
                  ? 'Ex: João Morais'
                  : 'Ex: T0001 ou 01031'
            "
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
  selectedCargoId = model<number | null>(null);

  setorList = input.required<BaseEntityDTO[]>();
  selectedSetorId = model<number | null>(null);

  searchType = input<'CPF' | 'MATRICULA' | 'NOME'>('NOME');
  searchTerm = model<string>('');

  // OUTPUTS: O que vamos avisar ao Pai
  statusChange = output<number | null>();
  cargoChange = output<number | null>();
  setorChange = output<number | null>();
  searchTypeChange = output<'CPF' | 'MATRICULA' | 'NOME'>();
  searchInput = output<Event>();
  cleanFilters = output<Event>();
}
