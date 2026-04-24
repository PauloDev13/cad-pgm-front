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
      class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-white md:bg-gray-50 p-4 md:p-5
             rounded-xl shadow-sm border border-gray-200"
    >
      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
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

      <mat-form-field
        appearance="outline"
        subscriptSizing="dynamic"
        class="w-full md:col-span-2"
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
  `,
  styles: ``,
  standalone: true
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
