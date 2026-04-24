import { Component, input } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-form-error',
  imports: [MatFormFieldModule],
  standalone: true,
  template: `
    @if (field().invalid() && field().touched() && field().errors().length > 0) {
      <mat-error
        class="!text-[12px] sm:!text-[13px] !leading-tight !text-red-600 block w-full line-clamp-1">
        {{ field().errors()[0].message }}
      </mat-error>
    }
  `
})
export class FormErrorComponent {
  field = input.required<any>();
}
