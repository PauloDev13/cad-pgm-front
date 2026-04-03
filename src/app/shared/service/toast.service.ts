import { inject, Injectable } from '@angular/core';
import { HotToastService } from '@ngxpert/hot-toast';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toaster = inject(HotToastService);

  success(message: string) {
    this.toaster.success(message, {
      duration: 3000,
    });
  }

  error(message: string) {
    this.toaster.error(message, {
      duration: 3000,
    });
  }

  // ✨ NOVO MÉTODO CUSTOMIZADO ✨
  errorCritical(title: string, message: string) {
    this.toaster.error(`<strong>${title}</strong><br>${message}`, {
      duration: 5000,
      icon: '<span class="material-icons" style="color: white; font-size: 28px;">delete_forever</span>',
      style: {
        background: '#ef4444', // Vermelho intenso
        color: '#fff', // Texto branco
        padding: '16px',
        borderRadius: '12px',
      },
    });
  }
}
