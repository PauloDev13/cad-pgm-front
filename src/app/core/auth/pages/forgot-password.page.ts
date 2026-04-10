import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { RouterModule } from '@angular/router';
import { ToastService } from '../../../shared/service/toast.service';
import { email, form, FormField, required, submit } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormErrorComponent } from '../../../shared/components/form-error/form-error.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    FormField,
    FormErrorComponent
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div class="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h2 class="text-2xl font-bold text-center text-gray-800 mb-2">Recuperar Senha</h2>
        <p class="text-center text-gray-600 mb-6 text-sm">
          Digite seu e-mail cadastrado e enviaremos um link para redefinir sua senha.
        </p>

        @if (mensagemSucesso()) {
          <div
            class="bg-green-50 text-green-700 p-4 rounded-lg mb-6 text-sm font-medium
                      border border-green-200"
          >
            {{ mensagemSucesso() }}
          </div>
          <button mat-button class="w-full" routerLink="/login">Voltar para o Login</button>
        } @else {
          <form (submit)="onSubmit($event)" autocomplete="off" class="flex flex-col gap-4">
            <div class="flex flex-col relative pb-5">
              <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                <mat-label>E-mail</mat-label>
                <input
                  matInput
                  type="email"
                  [formField]="forgotForm.email"
                  placeholder="exemplo@email.com"
                />
              </mat-form-field>
              <app-form-error [field]="forgotForm.email()" />
            </div>

            <!--            @if (mensagemErro()) {-->
            <!--              <span class="text-red-500 text-sm text-center font-medium">{{ mensagemErro() }}</span>-->
            <!--            }-->

            <button
              type="submit"
              [disabled]="forgotForm().invalid() || isLoading()"
              class="mt-2 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg
                    hover:bg-blue-700 transition-all disabled:opacity-70 flex justify-center
                    items-center gap-2 h-12"
            >
              @if (isLoading()) {
                <mat-spinner diameter="20" color="accent"></mat-spinner>
                <span>Enviando...</span>
              } @else {
                <span>Enviar Link</span>
              }
            </button>

            <div class="text-center mt-2">
              <a
                tabindex="-1"
                routerLink="/login"
                class="text-sm font-medium text-blue-600
              hover:text-blue-800 transition-colors"
              >
                Voltar para o Login
              </a>
            </div>
          </form>
        }
      </div>
    </div>
  `
})
export class ForgotPasswordPage {
  // Injeção de dependências
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  // Signals de estado
  isLoading = signal(false);
  mensagemSucesso = signal('');
  mensagemErro = signal('');

  // Modelo do formulário
  formModel = signal({ email: '' });

  // Formulário com validações
  forgotForm = form(this.formModel, (path) => {
    required(path.email, { message: 'O e-mail é obrigatório' });
    email(path.email, { message: 'Digite um e-mail válido' });
  });

  async onSubmit(event: Event) {
    event.preventDefault();
    this.mensagemErro.set('');

    await submit(this.forgotForm, async () => {
      this.isLoading.set(true);
      const payload = this.forgotForm().value();

      this.authService.forgotPassword(payload.email).subscribe({
        next: () => {
          this.isLoading.set(false);
          // Mensagem de sucesso (segurança: dizemos que enviamos mesmo se o email não existir para não vazar dados)
          this.mensagemSucesso.set(
            'Se o e-mail estiver cadastrado, você receberá um link de redefinição em instantes.'
          );
          this.toastService.success(
            'Se o e-mail estiver cadastrado, você receberá um link de redefinição em instantes.'
          );
        },
        error: (err) => {
          this.isLoading.set(false);
          this.mensagemErro.set(err.message);
          this.toastService.error(err.message);
        }
      });
    });
  }
}
