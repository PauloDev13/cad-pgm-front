import { Component, input } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading',
  imports: [MatProgressSpinner],
  standalone: true,
  // Adicione o host para garantir que a tag do Angular não ocupe espaço:
  host: {
    class: 'contents'
  },
  template: `
    @if (isLoading()) {
      <div
        class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80
              backdrop-blur-sm rounded-inherit"
        aria-live="assertive"
        aria-busy="true"
        role="progressbar"
        aria-valuetext="Carregando dados"
      >
        <mat-spinner diameter="50" color="primary"></mat-spinner>
        <span class="mt-4 text-sm font-semibold text-blue-600 tracking-wider animate-pulse">
      CARREGANDO...
    </span>
      </div>
    }
  `
})
export class LoadingComponent {
  isLoading = input.required<boolean>();
}
