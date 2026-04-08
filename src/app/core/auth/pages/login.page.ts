import { Component, signal } from '@angular/core';
import { FormInfoLoginComponent } from '../component/form-info-login.component';
import { FormMainLoginComponent } from '../component/form-main-login.component';
import { HeaderLoginComponent } from '../component/header-login.component';
import { FormRegisterUsuarioComponent } from '../../../features/usuario/components/form-register-usuario.component';

@Component({
  selector: 'app-login',
  imports: [
    FormInfoLoginComponent,
    FormMainLoginComponent,
    HeaderLoginComponent,
    FormRegisterUsuarioComponent,
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
        @if (isRegisterOrLogin()) {
          <!-- Formulário para login-->
          <app-form-main-login (onLoginOrRegister)="onLoginOrRegister()">
            <app-header-login
              title="Bem-vindo de volta"
              subtitle="Insira suas credenciais para acessar o painel."
            />
          </app-form-main-login>
        } @else {
          <!-- Formulário para cadastro de usuários-->
          <app-form-register-login (onLoginOrRegister)="onLoginOrRegister()">
            <app-header-login
              title="Bem-vindo"
              subtitle="Insira as informações e confirme o cadastro."
            />
          </app-form-register-login>
        }
      </div>
    </div>
  `,
})
export class LoginPage {
  isRegisterOrLogin = signal<boolean>(true);

  onLoginOrRegister() {
    this.isRegisterOrLogin.set(!this.isRegisterOrLogin());
  }
}
