import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { UploadService } from '../../services/upload.service';
import { ErrorHandlerService } from '../../../../shared/service/error-handler.service';
import { MatIconModule } from '@angular/material/icon';

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
  private readonly uploadService = inject(UploadService);
  private readonly errorHandlerService = inject(ErrorHandlerService);
  private destroyRef = inject(DestroyRef);

  photoUrl = signal<string | null>(null);
  servidorId = input.required<number | undefined>();

  constructor() {
    effect(() => {
      const id = this.servidorId();

      if (id) {
        this.loadPhoto(id);
      } else {
        this.clearPhotoMemory();
      }
    });

    this.destroyRef.onDestroy(() => {
      this.clearPhotoMemory();
    });

  }

  // Carrega a foto
  private loadPhoto(id: number) {
    this.uploadService.downloadPhoto(id)
      .subscribe({
        next: (blob) => {
          const objectUrl = URL.createObjectURL(blob);
          this.photoUrl.set(objectUrl);
        },
        error: (err) => {
          if (err.status !== 404) {
            this.errorHandlerService.handle(err, 'Baixar foto');
          }
          this.clearPhotoMemory();
        }
      });
  }

  // Limpa a sujeira deixada pela fotos em memória
  private clearPhotoMemory() {
    const currentUrl = this.photoUrl();
    if (currentUrl) {
      URL.revokeObjectURL(currentUrl);
    }
    this.photoUrl.set(null);
  }
}
