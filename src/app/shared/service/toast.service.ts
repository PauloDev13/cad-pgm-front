import { inject, Injectable } from '@angular/core';
import { HotToastService } from '@ngxpert/hot-toast';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toaster = inject(HotToastService);

  success(message: string) {
    this.toaster.success(message, {
      duration: 3000
    });
  }

  error(message: string) {
    this.toaster.error(message, {
      duration: 3000
    });
  }

  successLogin(title: string, message: string) {
    this.toaster.success(`
    <div class="text-xl">
      <div class="font-semibold">
       ${title}
      </div>

      <div class="border-t border-gray-300 my-2"></div>

      <div class="text-white text-[18px]">
        ${message}
      </div>
    </div>
    `, {
      duration: 3000,
      position: 'top-right',
      icon: `
        <span
          class="material-icons"
          style="color: white; font-size: 28px;">
          checked
        </span>`,
      style: {
        background: '#04850f',
        color: '#fff',
        padding: '16px',
        borderRadius: '12px'
      }
    });
  }


  errorLogin(title: string, message: string) {
    this.toaster.error(`
    <div class="text-[18px]">
      <div class="font-semibold">
       ${title}
      </div>

      <div class="border-t border-gray-300 my-2"></div>

      <div class="text-white text-[17px]">
        ${message}
      </div>
    </div>
    `, {
      duration: 3000,
      position: 'top-right',
      icon: '<span class="material-icons" style="color: white; font-size: 28px;">error</span>',
      style: {
        background: '#ef4444',
        color: '#fff',
        padding: '16px',
        borderRadius: '12px'
      }
    });
  }

  // NOVO MÉTODO CUSTOMIZADO
  errorCritical(title: string, message: string) {
    this.toaster.error(`<strong>${title}</strong><br>${message}`, {
      duration: 5000,
      icon: '<span class="material-icons" style="color: white; font-size: 28px;">delete_forever</span>',
      style: {
        background: '#ef4444', // Vermelho intenso
        color: '#fff', // Texto branco
        padding: '16px',
        borderRadius: '12px'
      }
    });
  }
}
