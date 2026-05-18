import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, signal } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { ErrorHandlerService } from '../../../../shared/service/error-handler.service';
import { ServidorService } from '../../services/servidor.service';

@Component({
  selector: 'app-photo',
  imports: [MatIconModule],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full h-full flex items-center justify-center overflow-hidden bg-white">
      @if (photoUrl()) {
        <img [src]="photoUrl()" alt="Foto do Servidor" class="object-cover w-full h-full" />
      } @else {
        <mat-icon class="text-gray-300 scale-[3]">person</mat-icon>
      }
    </div>
  `
})
export class PhotoComponent {
  private readonly servidorService = inject(ServidorService);
  private readonly errorHandlerService = inject(ErrorHandlerService);
  private destroyRef = inject(DestroyRef);

  // Guarda a URL da foto
  photoUrl = signal<string | null>(null);
  // Recebe o ID do Servidor via parâmetro na URL
  servidorId = input.required<number | undefined>();

  constructor() {
    effect(() => {
      const id = this.servidorId();

      // Se o ID não for null
      if (id) {
        this.loadPhotoServidor(id);
      }
    });

    this.destroyRef.onDestroy(() => {
      this.clearPhotoMemory();
    });
  }

  loadPhotoServidor(id: number) {
    this.servidorService.downloadPhoto(id)
      .subscribe({
        next: (blob) => {
          const objectUrl = URL.createObjectURL(blob);
          this.photoUrl.set(objectUrl);
        },
        error: (err) => {
          if (err.status !== 404) {
            this.errorHandlerService.handle(err, 'Baixar foto');
          }
        }
      });
  }

  // Limpa a sujeira deixada pelas fotos em memória
  private clearPhotoMemory() {
    const currentUrl = this.photoUrl();
    if (currentUrl) {
      URL.revokeObjectURL(currentUrl);
    }
    this.photoUrl.set(null);
  }
}
