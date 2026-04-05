import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { IFormCadLoginModel, IFormLoginModel } from '../models/auth.model';
import { email, form, maxLength, minLength, required, submit } from '@angular/forms/signals';
import { FormInfoLoginComponent } from '../component/form-info-login.component';
import { FormMainLoginComponent } from '../component/form-main-login.component';
import { HeaderLoginComponent } from '../component/header-login.component';
import { FormRegisterLoginComponent } from '../component/form-register-login.component';

@Component({
  selector: 'app-login',
  imports: [
    FormInfoLoginComponent,
    FormMainLoginComponent,
    HeaderLoginComponent,
    FormRegisterLoginComponent,
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
          <app-form-main-login
            [isLoading]="isLoading()"
            [isInvalid]="loginForm().invalid()"
            (onLoginSubmit)="onSubmit()"
            [errorMessage]="errorMessage()"
            [loginForm]="loginForm"
            (onLogin)="onLoginOrRegister()"
          >
            <app-header-login
              title="Bem-vindo de volta"
              subtitle="Insira suas credenciais para acessar o painel."
            />
          </app-form-main-login>
        } @else {
          <!-- Formulário para cadastro de usuários-->
          <app-form-register-login
            [isLoading]="isLoading()"
            [isInvalid]="loginCadForm().invalid()"
            (onRegisterSubmit)="onRegisterSubmit()"
            [loginCadForm]="loginCadForm"
            (onRegisterLogin)="onLoginOrRegister()"
          >
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
  // Controla se o formulário de Login ou de Cadastro são exibidos
  // Se verdadeiro, exibe Login, se falso, exibe cadastro
  isRegisterOrLogin = signal<boolean>(true);
  isLoading = signal<boolean>(false);
  errorMessage = signal('');

  // Modelo do formulário para login
  formLoginModel = signal<IFormLoginModel>({
    userName: '',
    password: '',
  });

  // Modelo do formulário para cadastro
  formCadLoginModel = signal<IFormCadLoginModel>({
    name: '',
    userName: '',
    password: '',
    email: '',
    activated: true,
    permissions: [],
  });

  // Formulário com validações
  loginCadForm = form(this.formCadLoginModel, (path) => {
    // Nome completo
    required(path.name, { message: 'Nome completo é obrigatório' });
    minLength(path.name, 5, { message: 'O Nome completo deve ter no mínimo 5 caracteres' });
    // Login
    required(path.userName, { message: 'login é obrigatório' });
    minLength(path.userName, 5, { message: 'O Login deve ter no mínimo 5 caracteres' });
    maxLength(path.userName, 30, { message: 'O Login deve ter no máximo 30 caracteres' });
    // Password
    required(path.password, { message: 'Senha é obrigatória' });
    minLength(path.password, 6, { message: 'Senha deve ter no mínimo 6 caracteres' });
    // E-mail
    required(path.email, { message: 'E-mail é obrigatório' });
    email(path.email, { message: 'E-mail inválido' });
  });

  // Formulário de login com validações
  loginForm = form(this.formLoginModel, (path) => {
    required(path.userName, { message: 'Nome do usuário é obrigatório' });
    required(path.password, { message: 'A senha é obrigatório' });
  });

  // Injeções de dependências
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Métodos
  async onSubmit() {
    this.isLoading.set(true);
    await submit(this.loginForm, async () => {
      const dataLogin = this.loginForm().value();
      console.log(dataLogin);
      this.authService.login(dataLogin).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['home']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.message);
        },
      });
    });
  }

  async onRegisterSubmit() {
    this.isLoading.set(true);

    await submit(this.loginCadForm, async () => {
      const dataRegister = this.loginCadForm().value();

      this.authService.register(dataRegister).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.isRegisterOrLogin.set(true);

          const data = {
            ...dataRegister,
            password: '',
          };

          this.loginForm().controlValue.set(data);
        },
        error: (err) => {
          this.isLoading.set(false);
          console.error(err.message);
        },
      });
    });
  }

  onLoginOrRegister() {
    this.isRegisterOrLogin.set(!this.isRegisterOrLogin());
  }
}
