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
}
