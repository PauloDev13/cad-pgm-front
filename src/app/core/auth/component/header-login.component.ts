import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header-login',
  imports: [MatIconModule],
  standalone: true,
  template: `
    <div class="flex items-center gap-3 mb-6 sm:mb-8">
      <mat-icon class="text-blue-600 !h-8 !w-8 !text-[32px] !leading-none shrink-0">
        corporate_fare
      </mat-icon>
      <span class="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight leading-tight">
    Sistema
    <span class="text-blue-600">de Gerenciamento</span>
  </span>
    </div>

    <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{{ title() }}</h1>
    <p class="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8">{{ subtitle() }}</p>
  `
})
export class HeaderLoginComponent {
  title = input.required<string>();
  subtitle = input.required<string>();
}
