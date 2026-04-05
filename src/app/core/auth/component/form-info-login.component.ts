import { Component } from '@angular/core';

@Component({
  selector: 'app-form-info-login',
  imports: [],
  standalone: true,
  template: `
    <div class="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-800"></div>

    <div class="relative z-10 text-center p-12 text-white">
      <img src="/img/logo_home.png" alt="Logo central" class="h-[300px] mb-4 " />
      <h2 class="text-4xl font-bold mb-4">Gestão inteligente e segura.</h2>
      <p class="text-lg text-blue-100 max-w-md mx-auto">
        Controle total sobre as permissões e dados dos servidores do seu departamento em uma única
        plataforma.
      </p>
    </div>
  `,
  styles: ``,
})
export class FormInfoLoginComponent {}
