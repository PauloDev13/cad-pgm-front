import { Component } from '@angular/core';
import { FormInfoLoginComponent } from '../component/form-info-login.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    FormInfoLoginComponent,
    RouterOutlet
  ],
  standalone: true,
  template: `
    <div class="min-h-screen flex w-full bg-white">
      <!-- coluna da imagem-->
      <div
        class="hidden lg:flex w-1/2 bg-blue-50 flex-col items-center justify-center
               relative overflow-hidden"
      >
        <app-form-info-login />
      </div>

      <!-- coluna do formulário-->
      <div class="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-24">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class AuthLayoutPage {
}
