import { Component, input } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-form-error',
  imports: [MatFormFieldModule],
  standalone: true,
  template: `
    @if (field().invalid() && field().touched()) {
      @for (error of field().errors(); track error) {
        <mat-error class="pl-3 text-xs">{{ error.message }}</mat-error>
      }
    }
  `,
})
export class FormErrorComponent {
  field = input.required<any>();
}
