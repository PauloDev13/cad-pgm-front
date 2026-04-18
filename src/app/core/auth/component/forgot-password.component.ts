import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { email, form, FormField, required, submit } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HeaderLoginComponent } from './header-login.component';
import { NotificationService } from '../../../shared/service/NotificationSnackbar.service';
import { FieldWrapperComponent } from '../../../shared/layout/component/field-wrapper.component';

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
    HeaderLoginComponent,
    FieldWrapperComponent
  ],
  template: `
    <div class="w-full max-w-md flex flex-col bg-white rounded-xl shadow-lg p-8">
      <app-header-login
        title="Recuperar Senha"
        subtitle="Digite seu e-mail cadastrado e enviaremos um link para redefinir sua senha."
      />

      <form (submit)="onSubmit($event)" autocomplete="off" class="flex flex-col gap-5 w-full">
        <div class="flex flex-col gap-1.5">
          <app-field-wrapper [field]="forgotForm.email()">
            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <mat-label>E-mail</mat-label>
              <input
                matInput
                type="email"
                [formField]="forgotForm.email"
                placeholder="exemplo@email.com"
              />
            </mat-form-field>
          </app-field-wrapper>
        </div>

        <div class="flex flex-col gap-1.5">
          <div class="flex justify-end items-center">
            <a
              tabindex="-1"
              href="#"
              routerLink="/auth/login"
              class="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              Voltar para o Login</a
            >
          </div>
        </div>

        <button
          type="submit"
          [disabled]="forgotForm().invalid() || isLoading()"
          class="mt-2 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg
                    hover:bg-blue-700 transition-all flex justify-center items-center gap-2 h-12
                    disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          @if (isLoading()) {
            <mat-spinner diameter="20" color="custom-spinner"></mat-spinner>
            <span>Enviando...</span>
          } @else {
            <span>Enviar Link</span>
          }
        </button>
      </form>
    </div>
  `
})
export class ForgotPasswordComponent {
  // Injeção de dependências
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  // Signals de estado
  isLoading = signal(false);
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
          // Mensagem enviamos que mesmo se o email não existir para não vazar dados)
          this.notificationService.success(
            `
              Se o e-mail estiver cadastrado, você receberá um link de redefinição em instantes.
            `,
            'E-mail'
          );

          this.router.navigate(['auth/login']);
        },
        error: (err: Error) => {
          this.isLoading.set(false);
          this.notificationService.error(err.message, 'E-mail');
        }
      });
    });
  }
}
