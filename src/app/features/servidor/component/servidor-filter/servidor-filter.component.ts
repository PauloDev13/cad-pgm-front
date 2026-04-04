import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { BaseEntityDTO } from '../../models/servidor.model';

@Component({
  selector: 'app-servidor-filter',
  imports: [CommonModule, MatFormFieldModule, MatSelectModule, MatInputModule, MatIconModule],
  standalone: true,
  template: `
    <div
      class="flex flex-col md:flex-row justify-between items-end gap-4 mb-6
      bg-gray-50 p-4 rounded-lg shadow-sm shadow-gray-300 border border-gray-300"
    >
      <div class="w-full md:w-64 bg-white">
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
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
      </div>

      <div class="flex flex-col md:flex-row gap-2 flex-1 w-full md:justify-end bg-white">
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-32">
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
          class="w-full md:w-96 lg:w-[450px]"
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
    </div>
  `,
  styles: ``,
})
export class ServidorFilterComponent {
  // INPUTS: O que o Pai vai mandar para cá
  statusList = input.required<BaseEntityDTO[]>();
  selectedStatusId = input<number | null>(null);
  searchType = input<'CPF' | 'MATRICULA' | 'NOME'>('NOME');
  searchTerm = input<string>('');

  // OUTPUTS: O que vamos avisar ao Pai
  statusChange = output<number | null>();
  searchTypeChange = output<'CPF' | 'MATRICULA' | 'NOME'>();
  searchInput = output<Event>();
}
