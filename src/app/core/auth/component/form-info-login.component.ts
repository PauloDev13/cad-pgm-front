import { Component } from '@angular/core';

@Component({
  selector: 'app-form-info-login',
  imports: [],
  standalone: true,
  template: `
    <div class="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-800"></div>

    <div class="relative z-10 text-center p-8 lg:p-12 text-white flex flex-col items-center">
      <img
        src="/img/logo_home.png"
        alt="Logo central"
        class="h-[200px] lg:h-[300px] w-auto object-contain mb-6 lg:mb-8"
      />
      <h2 class="text-3xl lg:text-4xl font-bold mb-4 leading-tight">Gestão inteligente e segura.</h2>
      <p class="text-base lg:text-lg text-blue-100 max-w-md mx-auto leading-relaxed">
        Controle total sobre as permissões e dados dos servidores do seu departamento
        em uma única plataforma.
      </p>
    </div>
  `,
  styles: ``
})
export class FormInfoLoginComponent {
}
