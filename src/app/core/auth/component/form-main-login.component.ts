import { Component, inject, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { MatInputModule } from '@angular/material/input';
import { IAuthRequest, IDecodedToken } from '../models/auth.model';
import { AuthService } from '../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { MatIconButton } from '@angular/material/button';
import { LoginStateService } from '../services/login-state.service';
import { HeaderLoginComponent } from './header-login.component';
import { FieldWrapperComponent } from '../../../shared/layout/component/field-wrapper.component';
import { NotificationService } from '../../../shared/service/NotificationSnackbar.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-form-main-login',
  imports: [
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    FormField,
    MatIconButton,
    RouterLink,
    HeaderLoginComponent,
    FieldWrapperComponent
  ],
  standalone: true,
  template: `
    <div class="w-full max-w-md flex flex-col bg-white rounded-xl shadow-lg p-8">
      <!-- Permite a injeção do componente HeaderLogin neste ponto-->
      <app-header-login
        title="Bem-vindo de volta"
        subtitle="Insira suas credenciais para acessar o painel."
      />

      <form (submit)="onSubmit($event)" autocomplete="off" class="flex flex-col w-full gap-2">
        <div class="flex flex-col gap-1.5">
          <app-field-wrapper [field]="loginForm.userName()">
            <!--Campo userName-->
            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <mat-label>Login do Usuário</mat-label>
              <input
                matInput
                [formField]="loginForm.userName"
                autocomplete="off"
                placeholder="Ex: jonh.river"
              />
            </mat-form-field>
          </app-field-wrapper>
        </div>

        <div class="flex flex-col gap-1.5">
          <app-field-wrapper [field]="loginForm.password!()">
            <!--Campo password-->
            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <mat-label>Senha</mat-label>
              <input
                [type]="hidePassword() ? 'password' : 'text'"
                matInput
                [formField]="loginForm.password!"
                autocomplete="new_password"
              />
              <button
                tabIndex="-1"
                class="!mr-2 text-gray-500 hover:text-gray-700"
                mat-icon-button
                matSuffix
                type="button"
                aria-label="Ocultar/Exibir senha"
                (click)="togglePassword($event)"
              >
                <mat-icon class="transition-transform duration-200 hover:scale-110">
                  {{ hidePassword() ? 'visibility_off' : 'visibility' }}
                </mat-icon>
              </button>
            </mat-form-field>
          </app-field-wrapper>
        </div>
        <div class="flex flex-col gap-1.5">
          <div class="flex justify-between items-center">
            <a
              tabindex="-1"
              routerLink="/auth/esqueci-senha"
              class="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >Esqueceu a senha?</a
            >
            <a
              routerLink="/auth/register"
              tabIndex="-1"
              href="#"
              class="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >Não é cadastrado?</a
            >
          </div>
        </div>

        <button
          type="submit"
          [disabled]="loginForm().invalid() || isLoading()"
          class="mt-4 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg
                 hover:bg-blue-700 transition-all flex justify-center items-center gap-2 h-12
                 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          @if (isLoading()) {
            <mat-spinner diameter="20" class="custom-spinner"></mat-spinner>
            <span>Autenticando...</span>
          } @else {
            <span>Entrar no Sistema</span>
          }
        </button>
      </form>
    </div>
  `
})
export class FormMainLoginComponent {
  // Injeções de dependências
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly loginStateService = inject(LoginStateService);

  // Signals
  isLoading = signal<boolean>(false);
  // Signals para exibir/ocultar senha
  hidePassword = signal<boolean>(true);

  // Modelo do formulário
  formLoginModel = signal<IAuthRequest>({
    userName: this.loginStateService.newUserName(),
    password: ''
  });

  // Formulário de login com validações
  loginForm = form(this.formLoginModel, (path: any) => {
    required(path.login, { message: 'Login é obrigatório' });
    required(path.password!, { message: 'Senha é obrigatória' });
  });

  constructor() {
    this.loginStateService.newUserName.set('');
  }

  // Métodos para alternar a visualização
  togglePassword(event: MouseEvent) {
    event.preventDefault(); // Evita que o formulário submeta ao clicar no botão do ícone
    this.hidePassword.set(!this.hidePassword());
  }

  async onSubmit(event: Event) {
    event.preventDefault();
    this.isLoading.set(true);
    await submit(this.loginForm, async () => {
      // pega os valores de todos os campos do fomulário
      const dataLogin = this.loginForm().value();

      // Chama o service para realizar enviar os dados de login
      this.authService.login(dataLogin).subscribe({
        next: (response) => {
          // Decodifica o token retornado da API
          const decoded = jwtDecode<IDecodedToken>(response.token);

          if (decoded.isForcePasswordChange) {
            this.router.navigate(['/auth/troca-obrigatoria']);
          } else {
            // Se o login foi bem-sucedido, vai para a página home
            this.router.navigate(['home']);
          }
          this.isLoading.set(false);
        },
        error: (err: Error) => {
          this.isLoading.set(false);
          this.notificationService.error(err.message, 'Login');
        }
      });
    });
  }
}
