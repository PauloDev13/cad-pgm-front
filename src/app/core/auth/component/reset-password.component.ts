import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { form, FormField, submit } from '@angular/forms/signals';
import { HeaderLoginComponent } from './header-login.component';
import { NotificationService } from '../../../shared/service/NotificationSnackbar.service';
import { FieldWrapperComponent } from '../../../shared/layout/component/field-wrapper/field-wrapper.component';
import { authFormModel, subscriptionSchema } from '../utils/subscription-auth';
import { AuthStore } from '../store/auth.store';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    FormField,
    HeaderLoginComponent,
    FieldWrapperComponent
  ],
  template: `
    <div
      class="w-full max-w-[450px] flex flex-col bg-white rounded-xl shadow-xl p-6 sm:p-8 border
             border-gray-100 lg:border-none lg:shadow-lg">

      <app-header-login
        title="Criar Nova Senha"
        subtitle="Digite e confirme sua nova senha de acesso."
      />

      @if (isValidatingToken()) {
        <div
          class="flex items-center justify-center gap-3 mb-6 p-4 bg-blue-50 text-blue-700
                 rounded-lg border border-blue-100">
          <mat-spinner diameter="20"></mat-spinner>
          <span class="text-sm font-medium">Analisando segurança do link...</span>
        </div>
      }

      <form (submit)="onSubmit($event)" autocomplete="off" class="flex flex-col w-full">
        <fieldset [disabled]="isValidatingToken() || isTokenInvalid()"
                  class="border-none p-0 m-0 disabled:cursor-not-allowed">
          <div class="flex flex-col gap-y-3">
            <app-field-wrapper [field]="resetForm.password()">
              <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                <mat-label>Nova Senha</mat-label>
                <input
                  matInput
                  autocomplete="new-password"
                  [type]="hidePassword() ? 'password' : 'text'"
                  [formField]="resetForm.password"
                />
                <button tabindex="-1"
                        mat-icon-button matSuffix
                        class="!mr-1 text-gray-500 hover:text-gray-700"
                        (click)="togglePassword($event)" type="button">
                  <mat-icon class="transition-transform duration-200 hover:scale-110">
                    {{ hidePassword() ? 'visibility_off' : 'visibility' }}
                  </mat-icon>
                </button>
              </mat-form-field>
            </app-field-wrapper>

            <app-field-wrapper [field]="resetForm.confirmPassword()">
              <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                <mat-label>Confirmar Nova Senha</mat-label>
                <input
                  matInput
                  autocomplete="new-password"
                  [type]="hideConfirm() ? 'password' : 'text'"
                  [formField]="resetForm.confirmPassword" />
                <button tabindex="-1"
                        mat-icon-button
                        type="button"
                        matSuffix class="!mr-1 text-gray-500 hover:text-gray-700"
                        (click)="toggleConfirm($event)">
                  <mat-icon class="transition-transform duration-200 hover:scale-110">
                    {{ hideConfirm() ? 'visibility_off' : 'visibility' }}
                  </mat-icon>
                </button>
              </mat-form-field>
            </app-field-wrapper>
          </div>
          <div class="flex justify-end items-center mb-4 px-1 mt-1">
            <a tabindex="-1"
               routerLink="/auth/login"
               class="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
              Voltar para o Login
            </a>
          </div>

          <button
            type="submit"
            [disabled]="resetForm().invalid() || isValidatingToken()"
            class="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700
                   transition-all flex justify-center items-center gap-2 h-12 disabled:bg-gray-300
                   disabled:cursor-not-allowed disabled:text-gray-500"
          >
            @if (isValidatingToken()) {
              <mat-spinner diameter="20" class="custom-spinner"></mat-spinner>
              <span>Salvando...</span>
            } @else {
              <span>Redefinir Senha</span>
            }
          </button>
        </fieldset>
      </form>
    </div>
  `
})
export class ResetPasswordComponent {
  //Injeção de dependência
  protected readonly authStore = inject(AuthStore);
  private readonly notificationService = inject(NotificationService);

  // O Angular ler ?token=XYZ da URL e joga aqui dentro automaticamente.
  token = input<string>('');
  isValidatingToken = computed(() =>
    this.authStore.resetTokenStatus() === 'validating');
  isTokenInvalid = computed(() =>
    this.authStore.resetTokenStatus() === 'invalid');

  // Controle dos ícones visuais
  hidePassword = signal(true);
  hideConfirm = signal(true);

  // Bloqueia o formulário se o token for ruim

  // Configuração e Validação (A mesma arquitetura de Ouro que usamos no Cadastro!)
  resetForm = form(authFormModel, subscriptionSchema);

  constructor() {
    effect(() => {
      const tokenValue = this.token();

      if (tokenValue) {
        this.authStore.validateResetToken(tokenValue);
      } else {
        this.authStore.setResetTokenInvalid();
        this.notificationService.warning(
          'Token de segurança não encontrado.', 'Senha'
        );
      }
    });
  }

  // Métodos de UX
  // Exibe e esconde os caracteres da senha
  togglePassword(event: MouseEvent) {
    event.preventDefault();
    this.hidePassword.set(!this.hidePassword());
  }

  toggleConfirm(event: MouseEvent) {
    event.preventDefault();
    this.hideConfirm.set(!this.hideConfirm());
  }

  // Submissão ao Backend
  async onSubmit(event: Event) {
    event.preventDefault();

    if (this.isTokenInvalid()) return; // Travamento extra

    // Prevenção extra caso o usuário chegue na tela sem token na URL
    if (!this.token()) {
      this.notificationService.error(
        `Token de segurança ausente. Por favor, acesse através do link
                  enviado para o seu e-mail.`,
        'Token'
      );
      return;
    }

    await submit(this.resetForm, async () => {

      // Extraímos apenas a senha final (o confirmPassword não vai pro backend)
      const { password } = this.resetForm().value();

      this.authStore.resetPassword({
        token: this.token(),
        password
      });
    });
  }
}
