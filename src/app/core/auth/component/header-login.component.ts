import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header-login',
  imports: [MatIconModule],
  standalone: true,
  template: `
    <div class="flex items-center gap-3 mb-8">
      <mat-icon class="text-blue-600 !h-8 !w-8 !text-3xl">corporate_fare</mat-icon>
      <span class="text-2xl font-bold text-gray-800 tracking-tight">
        Sistema
        <span class="text-blue-600">de Gerenciamento</span>
      </span>
    </div>

    <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ title() }}</h1>
    <p class="text-gray-500 mb-8">{{ subtitle() }}</p>
  `,
})
export class HeaderLoginComponent {
  title = input.required<string>();
  subtitle = input.required<string>();
}
