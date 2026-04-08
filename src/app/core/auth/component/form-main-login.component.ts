import { Component, inject, output, signal } from '@angular/core';
import { FormErrorComponent } from '../../../shared/components/form-error/form-error.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { MatInputModule } from '@angular/material/input';
import { IAuthRequest } from '../models/auth.model';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { MatIconButton } from '@angular/material/button';

@Component({
  selector: 'app-form-main-login',
  imports: [
    FormErrorComponent,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    FormField,
    MatIconButton,
  ],
  standalone: true,
  template: `
    <div class="w-full max-w-md flex flex-col">
      <!-- Permite a injeção do componente HeaderLogin neste ponto-->
      <ng-content />

      <form (submit)="onSubmit($event)" autocomplete="off" class="flex flex-col gap-5 w-full">
        @if (errorMessage()) {
          <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <p class="text-sm text-red-700 font-medium">{{ errorMessage() }}</p>
          </div>
        }

        <div class="flex flex-col gap-1.5">
          <!--Campo userName-->
          <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
            <mat-label>Nome do Usuário</mat-label>
            <input
              matInput
              [formField]="loginForm.login"
              autocomplete="off"
              placeholder="Ex: jonh.river"
            />
          </mat-form-field>

          <!--Chama o componente customizado para exibir os erros-->
          <app-form-error [field]="loginForm.login()" />
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
          <!--Chama o componente customizado para exibir os erros-->
          <app-form-error [field]="loginForm.password!()" />
        </div>

        <div class="flex flex-col gap-1.5">
          <div class="flex justify-between items-center">
            <a
              href="#"
              class="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >Esqueceu a senha?</a
            >
            <a
              (click)="goToRegisterLogin($event)"
              href="#"
              class="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >Não é cadastrado?</a
            >
          </div>
        </div>

        <button
          type="submit"
          [disabled]="loginForm().invalid() || isLoading()"
          class="mt-4 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-70 flex justify-center items-center gap-2 h-12"
        >
          @if (isLoading()) {
            <mat-spinner diameter="20" color="accent"></mat-spinner>
            <span>Autenticando...</span>
          } @else {
            <span>Entrar no Sistema</span>
          }
        </button>
      </form>
    </div>
  `,
})
export class FormMainLoginComponent {
  isLoading = signal<boolean>(false);
  errorMessage = signal('');
  hidePassword = signal<boolean>(true);
  //Outputs
  onLoginOrRegister = output<boolean>();
  // Modelo do formulário para login
  formLoginModel = signal<IAuthRequest>({
    login: '',
    password: '',
  });
  // Formulário de login com validações
  loginForm = form(this.formLoginModel, (path: any) => {
    required(path.login, { message: 'Nome do usuário é obrigatório' });
    required(path.password!, { message: 'A senha é obrigatório' });
  });
  // Injeções de dependências
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Métodos para alternar a visualização
  togglePassword(event: MouseEvent) {
    event.preventDefault(); // Evita que o formulário submeta ao clicar no botão do ícone
    this.hidePassword.set(!this.hidePassword());
  }

  async onSubmit(event: Event) {
    event.preventDefault();
    this.isLoading.set(true);
    await submit(this.loginForm, async () => {
      const dataLogin = this.loginForm().value();
      this.authService.login(dataLogin).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['home']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.loginForm().reset({ login: '', password: '' });
          this.errorMessage.set(err.message);
        },
      });
    });
  }

  goToRegisterLogin(event: Event) {
    event.preventDefault();
    this.onLoginOrRegister.emit(true);
  }
}
