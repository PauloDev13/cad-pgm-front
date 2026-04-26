import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormInfoLoginComponent } from '../component/form-info-login.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    FormInfoLoginComponent,
    RouterOutlet
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen flex w-full bg-white">
      <div class="hidden lg:flex w-1/2 bg-blue-50 flex-col items-center justify-center relative overflow-hidden">
        <app-form-info-login />
      </div>

      <div class="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 md:p-12 lg:p-24 bg-gray-50 lg:bg-white">
        <div class="w-full max-w-md">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `
})
export class AuthLayoutPage {
}
