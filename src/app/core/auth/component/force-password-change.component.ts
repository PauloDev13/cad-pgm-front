import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { form, FormField } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HeaderLoginComponent } from './header-login.component';
import { FieldWrapperComponent } from '../../../shared/layout/component/field-wrapper/field-wrapper.component';
import { authFormModel, subscriptionSchema } from '../utils/subscription-auth';
import { AuthStore } from '../store/auth.store';

@Component({
  selector: 'app-force-password-change',
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
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="w-full max-w-[450px] flex flex-col bg-white rounded-xl shadow-xl p-6 sm:p-8 border border-gray-100
             lg:border-none lg:shadow-lg">
      <app-header-login
        title="Troca obrigatória"
        subtitle="Sua senha foi resetada. Por segorança, defina uma nova senha agora"
      />

      <form (submit)="onSubmit($event)" autocomplete="off" class="flex flex-col w-full">
        <div class="flex flex-col gap-y-3">
          <app-field-wrapper [field]="changeForm.password()">
            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <mat-label>Nova Senha</mat-label>
              <input
                matInput
                [formField]="changeForm.password"
                autocomplete="new-password"
                [type]="hidePassword() ? 'password' : 'text'"
              />

              <button
                tabindex="-1"
                mat-icon-button
                matSuffix
                class="!mr-1 text-gray-500 hover:text-gray-700"
                (click)="togglePassword($event)"
                type="button"
              >
                <mat-icon class="transition-transform duration-200 hover:scale-110">
                  {{ hidePassword() ? 'visibility_off' : 'visibility' }}
                </mat-icon>
              </button>
            </mat-form-field>
          </app-field-wrapper>

          <app-field-wrapper [field]="changeForm.confirmPassword()">
            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <mat-label>Confirmar Nova Senha</mat-label>
              <input
                matInput
                autocomplete="new-password"
                [formField]="changeForm.confirmPassword"
                [type]="hideConfirm() ? 'password' : 'text'"
              />
              <button
                tabindex="-1"
                mat-icon-button
                matSuffix
                class="!mr-1 text-gray-500 hover:text-gray-700"
                (click)="toggleConfirm($event)"
                type="button"
              >
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
             class="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            Voltar para o Login</a
          >
        </div>

        <button
          type="submit"
          [disabled]="changeForm().invalid() || authStore.isLoading()"
          class="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700
                transition-all flex justify-center items-center gap-2 h-12 disabled:bg-gray-300
                disabled:cursor-not-allowed disabled:text-gray-500"
        >
          @if (authStore.isLoading()) {
            <mat-spinner diameter="20" class="custom-spinner"></mat-spinner>
            <span>Salvando...</span>
          } @else {
            <span>Redefinir Senha</span>
          }
        </button>
      </form>
    </div>
  `
})
export class ForcePasswordChangeComponent {
  protected readonly authStore = inject(AuthStore);

  // Controle dos ícones visuais
  hidePassword = signal(true);
  hideConfirm = signal(true);

  // Aqui você instancia o seu formulário de troca (igual ao que usamos no reset)
  changeForm = form(authFormModel, subscriptionSchema);

  onSubmit(event: Event) {
    event.preventDefault();

    // Se o formulário tem dados inválidos, aborta
    if (this.changeForm().invalid()) return;

    // Dispara a requisição na Store passando apenas a nova senha
    const newPassword = this.changeForm.password().value();
    this.authStore.forcePasswordChange(newPassword);
  }

  // Métodos de UX para exibir/ocultar caracteres da senha
  togglePassword(event: MouseEvent) {
    event.preventDefault();
    this.hidePassword.set(!this.hidePassword());
  }

  toggleConfirm(event: MouseEvent) {
    event.preventDefault();
    this.hideConfirm.set(!this.hideConfirm());
  }
}
