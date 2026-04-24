import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SnackbarData } from '../../model/snackbar-data.model';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-custom-snack-bar',
  imports: [MatIconModule, MatButtonModule],
  standalone: true,
  template: `
    <div
      class="flex items-start gap-3 p-4 rounded-xl shadow-xl text-white w-full max-w-sm sm:max-w-md pointer-events-auto"
      [class]="getBackgroundClass()"
      role="alert"
    >
      <mat-icon class="!w-6 !h-6 !text-[24px] !leading-none shrink-0 mt-0.5">
        {{ getIcon() }}
      </mat-icon>

      <div class="flex-1 flex flex-col">
        @if (data.title) {
          <span class="font-bold text-base mb-1 tracking-wide">{{ data.title }}</span>
        }
        <span [innerHTML]="data.message" class="text-sm sm:text-base leading-snug text-white/95"></span>
      </div>

      <button
        mat-icon-button
        aria-label="Fechar notificação"
        class="!w-8 !h-8 !flex !items-center !justify-center shrink-0 -mt-2 -mr-2 opacity-80 hover:opacity-100 !transition-opacity"
        (click)="fechar()"
      >
        <mat-icon class="!text-white !text-[20px] !w-[20px] !h-[20px] !leading-[20px] !m-0 !p-0">close</mat-icon>
      </button>
    </div>
  `,
  // Removemos o padding padrão do Material para que o nosso Tailwind controle a caixa
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class CustomSnackBarComponent {
  public data: SnackbarData = inject(MAT_SNACK_BAR_DATA);
  private snackBarRef = inject(MatSnackBarRef);

  fechar(): void {
    this.snackBarRef.dismiss();
  }

  getBackgroundClass(): string {
    switch (this.data.type) {
      case 'success':
        return 'bg-green-600';
      case 'error':
        return 'bg-red-600';
      case 'warning':
        return 'bg-amber-600'; // Amarelo escuro ideal para alertas com texto branco
      default:
        return 'bg-gray-800';
    }
  }

  getIcon(): string {
    switch (this.data.type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  }
}

