import { Component, inject, input, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { form, FormField, minLength, required, submit, validate } from '@angular/forms/signals';
import { FormErrorComponent } from '../../../shared/components/form-error/form-error.component';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../../../shared/service/toast.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    FormField,
    FormErrorComponent
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div class="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h2 class="text-2xl font-bold text-center text-gray-800 mb-2">Criar Nova Senha</h2>
        <p class="text-center text-gray-600 mb-6 text-sm">
          Digite e confirme sua nova senha de acesso.
        </p>

        @if (mensagemSucesso()) {
          <div
            class="bg-green-50 text-green-700 p-4 rounded-lg mb-6 text-sm font-medium
                      border border-green-200 text-center"
          >
            {{ mensagemSucesso() }}
          </div>
          <button
            mat-flat-button
            color="primary"
            class="w-full h-12 !text-base"
            routerLink="/login"
          >
            Ir para o Login
          </button>
        } @else {
          <form (submit)="onSubmit($event)" autocomplete="off" class="flex flex-col gap-2">
            <div class="flex flex-col relative pb-5">
              <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                <mat-label>Nova Senha</mat-label>
                <input
                  autocomplete="new-password"
                  [type]="hidePassword() ? 'password' : 'text'"
                  matInput
                  [formField]="resetForm.password"
                />

                <button
                  tabindex="-1"
                  mat-icon-button
                  matSuffix
                  class="!mr-1 text-gray-500 hover:text-gray-700 group"
                  (click)="togglePassword($event)"
                  type="button"
                >
                  <mat-icon class="transition-transform duration-200 hover:scale-110">
                    {{ hidePassword() ? 'visibility_off' : 'visibility' }}
                  </mat-icon>
                </button>
              </mat-form-field>
              <app-form-error [field]="resetForm.password()" />
            </div>

            <div class="flex flex-col relative pb-5">
              <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                <mat-label>Confirmar Nova Senha</mat-label>
                <input
                  autocomplete="new-password"
                  [type]="hideConfirm() ? 'password' : 'text'"
                  matInput
                  [formField]="resetForm.confirmPassword"
                />

                <button
                  tabindex="-1"
                  mat-icon-button
                  matSuffix
                  class="!mr-1 text-gray-500 hover:text-gray-700 group"
                  (click)="toggleConfirm($event)"
                  type="button"
                >
                  <mat-icon class="transition-transform duration-200 hover:scale-110">
                    {{ hideConfirm() ? 'visibility_off' : 'visibility' }}
                  </mat-icon>
                </button>
              </mat-form-field>
              <app-form-error [field]="resetForm.confirmPassword()" />
            </div>

            @if (mensagemErro()) {
              <span class="text-red-500 text-sm text-center font-medium mt-2">{{
                  mensagemErro()
                }}</span>
            }

            <button
              type="submit"
              [disabled]="resetForm().invalid() || isLoading()"
              class="mt-4 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg
                    hover:bg-blue-700 transition-all disabled:opacity-70 flex justify-center
                    items-center gap-2 h-12"
            >
              @if (isLoading()) {
                <mat-spinner diameter="20" color="accent"></mat-spinner>
                <span>Salvando...</span>
              } @else {
                <span>Redefinir Senha</span>
              }
            </button>
          </form>
        }
      </div>
    </div>
  `
})
export class ResetPasswordPage {
  //Indeção de dependência
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  // O Angular lê ?token=XYZ da URL e joga aqui dentro automaticamente.
  token = input<string>('');
  // Estado da tela
  isLoading = signal(<boolean>false);
  mensagemSucesso = signal<string>('');
  mensagemErro = signal<string>('');
  // Controle dos ícones visuais
  hidePassword = signal(true);
  hideConfirm = signal(true);

  // Modelo do Formulário
  resetModel = signal({
    password: '',
    confirmPassword: ''
  });

  // Configuração e Validação (A mesma arquitetura de Ouro que usamos no Cadastro!)
  resetForm = form(this.resetModel, (path) => {
    required(path.password, { message: 'A nova senha é obrigatória' });
    minLength(path.password, 6, { message: 'A senha deve ter no mínimo 6 caracteres' });

    required(path.confirmPassword, { message: 'A confirmação é obrigatória' });

    validate(path.confirmPassword, (valorAtual) => {
      const senhaOriginal = this.resetModel().password;
      if (valorAtual.value() !== senhaOriginal) {
        return { kind: 'passwordMismatch', message: 'As senhas não conferem' };
      }
      return null;
    });
  });

  // Métodos de UX
  togglePassword(event: MouseEvent) {
    event.preventDefault();
    this.hidePassword.set(!this.hidePassword());
  }

  toggleConfirm(event: MouseEvent) {
    event.preventDefault();
    this.hideConfirm.set(!this.hideConfirm());
  }

  // Submissão ao Backend Real
  async onSubmit(event: Event) {
    event.preventDefault();
    this.mensagemErro.set('');

    // Prevenção extra caso o usuário chegue na tela sem token na URL
    if (!this.token()) {
      this.toastService.error(
        'Token de segurança ausente. Por favor, acesse através do link ' +
        'enviado para o seu e-mail.'
      );
      this.mensagemErro.set(
        'Token de segurança ausente. Por favor, acesse através do link ' +
        'enviado para o seu e-mail.'
      );
      return;
    }

    await submit(this.resetForm, async () => {
      this.isLoading.set(true);

      // Extraímos apenas a senha final (o confirmPassword não vai pro backend)
      const { password } = this.resetForm().value();

      this.authService.resetPassword(this.token(), password).subscribe({
        next: () => {
          this.isLoading.set(false);
          // Ocultamos o formulário mostrando o @if (mensagemSucesso())
          this.toastService.success(
            'Senha atualizada com sucesso! Você já pode acessar o sistema.'
          );
          this.mensagemSucesso.set('Senha atualizada com sucesso! Você já pode acessar o sistema.');
        },
        error: (err) => {
          this.isLoading.set(false);
          this.toastService.error(err.message);
          this.mensagemErro.set(err.message);
        }
      });
    });
  }
}
