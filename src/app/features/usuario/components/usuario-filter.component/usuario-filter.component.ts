import { Component, input, output } from '@angular/core';
import { MatFormField, MatInput, MatLabel, MatPrefix } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';

@Component({
  selector: 'app-usuario-filter',
  imports: [MatFormField, MatIcon, MatInput, MatLabel, MatOption, MatPrefix, MatSelect],
  template: `
    <div
      class="flex flex-col md:flex-row justify-between items-end gap-4 mb-6
      bg-gray-50 p-4 rounded-lg shadow-sm shadow-gray-300 border border-gray-300"
    >
      <div class="w-full md:w-64 bg-white">
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-32">
          <mat-label>Filtrar por</mat-label>
          <mat-select
            [value]="searchType()"
            (selectionChange)="searchTypeChange.emit($event.value)"
          >
            <mat-option value="NOME">NOME</mat-option>
            <mat-option value="LOGIN">LOGIN</mat-option>
            <mat-option value="EMAIL">EMAIL</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="flex flex-col md:flex-row gap-2 flex-1 w-full md:justify-end bg-white">
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
              searchType() === 'NOME'
                ? 'Ex: John Davis'
                : searchType() === 'LOGIN'
                  ? 'Ex: john.davis'
                  : 'Ex: john@gmail.com'
            "
          />
          <mat-icon matIconPrefix class="text-gray-500">search</mat-icon>
        </mat-form-field>
      </div>
    </div>
  `,
  styles: ``,
})
export class UsuarioFilterComponent {
  // INPUTS: O que o Pai vai mandar para cá
  searchType = input<'NOME' | 'LOGIN' | 'EMAIL'>('NOME');
  searchTerm = input<string>('');

  // OUTPUTS: O que vamos avisar ao Pai
  statusChange = output<number | null>();
  searchTypeChange = output<'NOME' | 'LOGIN' | 'EMAIL'>();
  searchInput = output<Event>();
}
