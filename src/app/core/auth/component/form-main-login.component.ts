import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { MatInputModule } from '@angular/material/input';
import { IAuthRequest } from '../models/auth.model';
import { RouterLink } from '@angular/router';
import { MatIconButton } from '@angular/material/button';
import { HeaderLoginComponent } from './header-login.component';
import { FieldWrapperComponent } from '../../../shared/layout/component/field-wrapper/field-wrapper.component';
import { AuthStore } from '../store/auth.store';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="w-full flex flex-col bg-white rounded-xl shadow-xl p-6 sm:p-8 border border-gray-100
             lg:border-none lg:shadow-lg">
      <app-header-login
        title="Bem-vindo de volta"
        subtitle="Insira suas credenciais para acessar o painel."
      />

      <form (submit)="onSubmit($event)" autocomplete="off" class="flex flex-col w-full">
        <div class="flex flex-col gap-y-3">
          <app-field-wrapper [field]="loginForm.userName()">
            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <mat-label>Login do Usuário</mat-label>
              <input
                matInput
                [formField]="loginForm.userName"
                autocomplete="off"
                placeholder="Ex: jonh.river" />
            </mat-form-field>
          </app-field-wrapper>

          <app-field-wrapper [field]="loginForm.password!()">
            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <mat-label>Senha</mat-label>
              <input [type]="hidePassword() ? 'password' : 'text'" matInput [formField]="loginForm.password!"
                     autocomplete="new_password" />
              <button tabIndex="-1" class="!mr-1 text-gray-500 hover:text-gray-700" mat-icon-button matSuffix
                      type="button" aria-label="Ocultar/Exibir senha" (click)="togglePassword($event)">
                <mat-icon class="transition-transform duration-200 hover:scale-110">
                  {{ hidePassword() ? 'visibility_off' : 'visibility' }}
                </mat-icon>
              </button>
            </mat-form-field>
          </app-field-wrapper>
        </div>
        <div class="flex justify-between items-center mb-4 px-1 mt-1">
          <a tabindex="-1"
             routerLink="/auth/esqueci-senha"
             class="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
            Esqueceu a senha?
          </a>
          <a tabindex="-1"
             routerLink="/auth/register"
             class="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
            Não é cadastrado?
          </a>
        </div>

        <button
          type="submit"
          [disabled]="loginForm().invalid() || authStore.isLoading()"
          class="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700
                 transition-all flex justify-center items-center gap-2 h-12 disabled:bg-gray-200
                 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          @if (authStore.isLoading()) {
            <mat-spinner diameter="20" color="primary"></mat-spinner>
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
  protected readonly authStore = inject(AuthStore);

  // Signals
  isLoading = signal<boolean>(false);

  // Signals para exibir/ocultar senha
  hidePassword = signal<boolean>(true);

  // Modelo do formulário
  formLoginModel = signal<IAuthRequest>({
    userName: this.authStore.rememberedUsername(),
    password: ''
  });

  // Formulário de login com validações
  loginForm = form(this.formLoginModel, (path: any) => {
    required(path.userName, { message: 'Login é obrigatório' });
    required(path.password!, { message: 'Senha é obrigatória' });
  });

  constructor() {
    // this.loginStateService.newUserName.set('');
  }

  // Métodos para alternar a visualização
  togglePassword(event: MouseEvent) {
    event.preventDefault(); // Evita que o formulário submeta ao clicar no botão do ícone
    this.hidePassword.set(!this.hidePassword());
  }

  async onSubmit(event: Event) {
    event.preventDefault();

    await submit(this.loginForm, async () => {
      // pega os valores de todos os campos do fomulário
      const dataLogin = this.loginForm().value();

      this.authStore.login(dataLogin);
    });
  }
}
