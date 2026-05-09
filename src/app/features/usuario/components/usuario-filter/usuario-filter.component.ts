import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatInput, MatLabel, MatPrefix } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-usuario-filter',
  imports: [
    MatFormFieldModule,
    MatIconModule,
    MatInput,
    MatLabel,
    MatOptionModule,
    MatPrefix,
    MatSelectModule
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-white md:bg-gray-50 p-4 md:p-5
             rounded-xl border border-gray-200"
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
  styles: ``
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
