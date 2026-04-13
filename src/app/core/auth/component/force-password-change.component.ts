import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { form, FormField, minLength, required, validate } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormErrorComponent } from '../../../shared/components/form-error/form-error.component';
import { HeaderLoginComponent } from './header-login.component';
import { NotificationService } from '../../../shared/service/NotificationSnackbar.service';


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
    FormErrorComponent,
    HeaderLoginComponent
  ],
  standalone: true,
  template: `
    <div class="w-full max-w-md flex flex-col bg-white rounded-xl shadow-lg p-8">
      <app-header-login
        title="Troca obrigatória"
        subtitle="Sua senha foi resetada. Por segorança, defina uma nova senha agora" />

      <form (submit)="onSubmit($event)" autocomplete="off" class="flex flex-col gap-2">
        <div class="flex flex-col relative pb-5">
          <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
            <mat-label>Nova Senha</mat-label>
            <input
              autocomplete="new-password"
              [type]="hidePassword() ? 'password' : 'text'"
              matInput
              [formField]="form.password"
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
          <app-form-error [field]="form.password()" />
        </div>

        <div class="flex flex-col relative pb-5">
          <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
            <mat-label>Confirmar Nova Senha</mat-label>
            <input
              autocomplete="new-password"
              [type]="hideConfirm() ? 'password' : 'text'"
              matInput
              [formField]="form.confirmPassword"
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
          <app-form-error [field]="form.confirmPassword()" />
        </div>
        <div class="flex flex-col gap-1.5">
          <div class="flex justify-end items-center">
            <a
              tabindex="-1"
              href="#"
              routerLink="/auth/login"
              class="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
            > Voltar para o Login</a
            >
          </div>
        </div>

        <button
          type="submit"
          [disabled]="form().invalid() || isLoading()"
          class="mt-4 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg
                    hover:bg-blue-700 transition-all disabled:opacity-70 flex justify-center
                    items-center gap-2 h-12"
        >
          @if (form().invalid() || isLoading()) {
            <mat-spinner diameter="20" color="accent"></mat-spinner>
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
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  // private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  isLoading = signal(false);
  // Controle dos ícones visuais
  hidePassword = signal(true);
  hideConfirm = signal(true);

  // Modelo do Formulário
  resetModel = signal({
    password: '',
    confirmPassword: ''
  });

  // Aqui você instancia o seu formulário de troca (igual ao que usamos no reset)
  form = form(this.resetModel, (path) => {
    required(path.password, { message: 'A nova senha é obrigatória' });
    minLength(path.password, 6, { message: 'A senha deve ter no mínimo 6 caracteres' });

    required(path.confirmPassword, { message: 'A confirmação é obrigatória' });

    validate(path.confirmPassword, (valorAtual: any) => {
      const senhaOriginal = this.resetModel().password;
      if (valorAtual.value() !== senhaOriginal) {
        return { kind: 'passwordMismatch', message: 'As senhas não conferem' };
      }
      return null;
    });
  });

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.form().invalid()) return;

    this.isLoading.set(true);

    // O backend precisa do userName. Podemos pegar do Token que já está no storage!
    const userName = this.authService.getStoredLoggedUser()?.userName;
    const newPassword = this.form.password().value();

    this.authService.forcePasswordChange(userName!, newPassword).subscribe({
      next: () => {
        // Atualizamos o frontend antes de navegar
        const currentUser = this.authService.currentUser();

        if (currentUser) {
          // Criamos um clone do usuário mudando a flag para false
          const updatedUser = { ...currentUser, forcePasswordChange: false };

          // Atualiza o Signal para o app inteiro saber
          this.authService.currentUser.set(updatedUser);

          // Atualiza o Storage para ele não ficar preso se der F5
          localStorage.setItem(this.authService.AUTH_KEY, JSON.stringify(updatedUser));

          // Agora sim! O Angular sabe que a flag é falsa, e a navegação será permitida!
          this.router.navigate(['home']).then();
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.notificationService.error(
          err.message,
          'Senha'
        );
        // this.toastService.errorLogin('Senha', err.message);
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
}
