import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { form, FormField, minLength, required, submit, validate } from '@angular/forms/signals';
import { AuthService } from '../services/auth.service';
import { HeaderLoginComponent } from './header-login.component';
import { NotificationService } from '../../../shared/service/NotificationSnackbar.service';
import { FieldWrapperComponent } from '../../../shared/layout/component/field-wrapper.component';
import { finalize } from 'rxjs';

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
      class="w-full flex flex-col bg-white rounded-xl shadow-xl p-6 sm:p-8 border border-gray-100 lg:border-none lg:shadow-lg">
      <app-header-login
        title="Criar Nova Senha"
        subtitle="Digite e confirme sua nova senha de acesso."
      />

      @if (isValidatingToken()) {
        <div
          class="flex items-center justify-center gap-3 mb-6 p-4 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
          <mat-spinner diameter="20"></mat-spinner>
          <span class="text-sm font-medium">Analisando segurança do link...</span>
        </div>
      }

      <form (submit)="onSubmit($event)" autocomplete="off" class="flex flex-col w-full">
        <fieldset [disabled]="isValidatingToken() || isTokenInvalid()"
                  class="border-none p-0 m-0 disabled:cursor-not-allowed">

          <app-field-wrapper [field]="resetForm.password()">
            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <mat-label>Nova Senha</mat-label>
              <input autocomplete="new-password" [type]="hidePassword() ? 'password' : 'text'" matInput
                     [formField]="resetForm.password" />
              <button tabindex="-1" mat-icon-button matSuffix class="!mr-1 text-gray-500 hover:text-gray-700"
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
              <input autocomplete="new-password" [type]="hideConfirm() ? 'password' : 'text'" matInput
                     [formField]="resetForm.confirmPassword" />
              <button tabindex="-1" mat-icon-button matSuffix class="!mr-1 text-gray-500 hover:text-gray-700"
                      (click)="toggleConfirm($event)" type="button">
                <mat-icon class="transition-transform duration-200 hover:scale-110">
                  {{ hideConfirm() ? 'visibility_off' : 'visibility' }}
                </mat-icon>
              </button>
            </mat-form-field>
          </app-field-wrapper>

          <div class="flex justify-end items-center mb-4 px-1 mt-1">
            <a tabindex="-1" routerLink="/auth/login"
               class="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">Voltar para o Login</a>
          </div>

          <button
            type="submit"
            [disabled]="resetForm().invalid() || isLoading()"
            class="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-all flex justify-center items-center gap-2 h-12 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-500"
          >
            @if (isLoading()) {
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
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  // Estado da tela
  isLoading = signal(<boolean>false);
  // O Angular ler ?token=XYZ da URL e joga aqui dentro automaticamente.
  token = input<string>('');
  // Controle dos ícones visuais
  hidePassword = signal(true);
  hideConfirm = signal(true);

  // Exibe um spinner inicial
  isValidatingToken = signal(true);
  // Bloqueia o formulário se o token for ruim
  isTokenInvalid = signal(false);

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

  constructor() {
    effect(() => {
      const tokenValue = this.token();

      if (tokenValue) {
        this.checkToken(tokenValue);
      } else {
        this.handleInvalidToken('Token de segurança não encontrado.');
      }
    });
  }

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
    if (this.isTokenInvalid()) return; // Travamento extra

    // Prevenção extra caso o usuário chegue na tela sem token na URL
    if (!this.token()) {
      this.notificationService.error(
        `Token de segurança ausente. Por favor, acesse através do link
                  enviado para o seu e-mail.`,
        'Token'
      );

      this.notificationService.error(
        `Token de segurança ausente. Por favor, acesse através do link
                  enviado para o seu e-mail.`,
        'Token'
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

          this.notificationService.success(
            `Senha atualizada com sucesso! Você já pode acessar o sistema.
              `,
            'Senha'
          );

          this.router.navigate(['auth/login']);

        },
        error: (err: Error) => {
          this.isLoading.set(false);
          this.notificationService.error(err.message, 'Link');
        }
      });
    });
  }

  private checkToken(token: string) {
    this.authService.validateResetToken(token).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: () => {
        // Token OK! Esconde o spinner e deixa o formulário habilitado
        this.isValidatingToken.set(false);
      },
      error: (err: Error) => {
        // Token Ruim!
        this.handleInvalidToken(err.message);
      }
    });
  }

  private handleInvalidToken(message: string) {
    this.isValidatingToken.set(false);
    this.isTokenInvalid.set(true); // Isso vai desabilitar a UI

    // Dispara o nosso Snackbar personalizado com a mensagem de erro
    this.notificationService.error(message, 'Link');
  }
}
