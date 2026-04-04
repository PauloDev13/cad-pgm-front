import { Component, input } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading',
  imports: [MatProgressSpinner],
  standalone: true,
  template: `
    @if (isLoading()) {
      <div
        class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm"
      >
        <mat-spinner diameter="50" color="primary"></mat-spinner>
        <span class="mt-4 text-sm font-semibold text-blue-600 tracking-wider animate-pulse">
          CARREGANDO...
        </span>
      </div>
    }
  `,
  styles: ``,
})
export class LoadingComponent {
  isLoading = input.required<boolean>();
}
