import { Component, input } from '@angular/core';

@Component({
  selector: 'app-data-display',
  imports: [],
  standalone: true,
  template: `
    <div class="flex flex-col">
      <span class="text-xs font-bold text-gray-600 uppercase tracking-wider">{{ label() }}</span>
      <span class="text-base text-gray-800 font-medium">{{ fieldData() || 'Não informado' }}</span>
    </div>
  `,
})
export class DataDisplayComponent {
  label = input.required<string>();
  fieldData = input.required<string | number | null | undefined>();
}
