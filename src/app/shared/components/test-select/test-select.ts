import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { FormField } from '@angular/forms/signals';

@Component({
  selector: 'app-test-select',
  imports: [MatFormFieldModule, MatSelectModule, MatOptionModule, FormField],
  standalone: true,
  template: `
    <mat-form-field appearance="outline" class="w-full" floatLabel="always">
      <mat-label>{{ label() }}</mat-label>

      <mat-select [formField]="field" [placeholder]="placeholder()">
        @for (option of options(); track option.id) {
          <mat-option [value]="option.id">
            {{ option.nome }}
          </mat-option>
        }
      </mat-select>

      @if (field().invalid() && field().touched()) {
        <mat-error>
          {{ field().errors()[0].message }}
        </mat-error>
      }
    </mat-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestSelect {
  label = input.required<string>();
  placeholder = input<string>('Selecione');

  field = input.required<any>(); // Signal FormField

  // options = input.required<SelectOption[]>();
  options = input.required<any[]>();
}
