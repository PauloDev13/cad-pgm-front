import { Component, input } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-form-error',
  imports: [MatFormFieldModule],
  standalone: true,
  template: `
    @if (field().invalid() && field().touched() && field().errors().length > 0) {
      <mat-error class="pl-3 text-xs leading-tight font-medium text-red-500 block w-full">
        {{ field().errors()[0].message }}
      </mat-error>
    }
  `
})
export class FormErrorComponent {
  field = input.required<any>();
}
