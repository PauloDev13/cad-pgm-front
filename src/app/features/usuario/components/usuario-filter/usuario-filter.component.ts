import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-usuario-filter',
  imports: [MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule, MatButton],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-white md:bg-gray-50 p-4 md:p-5
             rounded-xl border border-gray-200 items-start"
    >
      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
        <mat-label>Filtrar por</mat-label>
        <mat-select [value]="searchType()" (selectionChange)="searchTypeChange.emit($event.value)">
          <mat-option value="NOME">NOME</mat-option>
          <mat-option value="LOGIN">LOGIN</mat-option>
          <mat-option value="EMAIL">EMAIL</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full md:col-span-2">
        <mat-label>Digite para buscar...</mat-label>
        <input
          matInput
          [value]="searchTerm()"
          (input)="searchInput.emit($event)"
          [placeholder]="
            searchType() === 'NOME'
              ? 'Ex: José Andrade'
              : searchType() === 'LOGIN'
                ? 'Ex: José Andrade'
                : 'Ex: jandrade@gmail.com'
          "
        />
        <mat-icon matIconPrefix class="text-gray-500">search</mat-icon>
      </mat-form-field>
      <button
        mat-stroked-button
        (click)="cleanFilters.emit($event)"
        class="md:col-span-1 w-full sm:w-auto !border-blue-600 !text-blue-600 !transition-transform
               duration-300 hover:!scale-105 order-3 sm:order-1"
      >
        Limpar
        <mat-icon>delete_sweep</mat-icon>
      </button>
    </div>
  `,
})
export class UsuarioFilterComponent {
  // INPUTS: O que o Pai vai mandar para cá
  searchType = input<'NOME' | 'LOGIN' | 'EMAIL'>('NOME');
  searchTerm = input<string>('');

  // OUTPUTS: O que vamos avisar ao Pai
  searchTypeChange = output<'NOME' | 'LOGIN' | 'EMAIL'>();
  searchInput = output<Event>();
  cleanFilters = output<Event>();
}
