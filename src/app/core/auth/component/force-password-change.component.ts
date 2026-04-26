import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { form, FormField, minLength, required, validate } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HeaderLoginComponent } from './header-login.component';
import { NotificationService } from '../../../shared/service/NotificationSnackbar.service';
import { FieldWrapperComponent } from '../../../shared/layout/component/field-wrapper.component';
import { LoginStateService } from '../services/login-state.service';
import { finalize } from 'rxjs';

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
      class="w-full flex flex-col bg-white rounded-xl shadow-xl p-6 sm:p-8 border border-gray-100 lg:border-none lg:shadow-lg">
      <app-header-login
        title="Troca obrigatória"
        subtitle="Sua senha foi resetada. Por segorança, defina uma nova senha agora"
      />

      <form (submit)="onSubmit($event)" autocomplete="off" class="flex flex-col w-full">
        <!--        <div class="flex flex-col">-->
        <app-field-wrapper class="py-3" [field]="form.password()">
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
        <!--        </div>-->

        <!--        <div class="flex flex-col">-->
        <app-field-wrapper [field]="form.confirmPassword()">
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
        <!--        </div>-->
        <div class="flex justify-end items-center mb-4 px-1 mt-1">
          <a
            tabindex="-1"
            href="#"
            routerLink="/auth/login"
            class="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            Voltar para o Login</a
          >
        </div>

        <button
          type="submit"
          [disabled]="form().invalid() || isLoading()"
          class="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700
                transition-all flex justify-center items-center gap-2 h-12 disabled:bg-gray-300
                disabled:cursor-not-allowed disabled:text-gray-500"
        >
          @if (isLoading()) {
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
  private readonly authService = inject(AuthService);
  private readonly loginStateService = inject(LoginStateService);
  private readonly notificationService = inject(NotificationService);
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

    this.authService.forcePasswordChange(userName!, newPassword).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: () => {
        this.isLoading.set(false);

        // Pega o nome do usuário logado do Signal currentUser
        const userLogged: string | undefined = this.authService.currentUser()?.userName;

        // Se houver usuário logado
        if (userLogged) {
          // Seta o Signal newUserName usado para exibir o nome do usuário na tela de login
          this.loginStateService.newUserName.set(userLogged);
        }

        // Realiza o logout para limpar o localstorage
        this.authService.logout();

        // Avisamos o usuário que deu tudo certo
        this.notificationService.success(
          'Senha atualizada com sucesso! Por favor, faça login com a nova senha.',
          'Senha'
        );

        // Agora sim! O Angular sabe que a flag é falsa, e a navegação será permitida!
        this.router.navigate(['/auth/home']).then();
      },
      error: (err: Error) => {
        // this.isLoading.set(false);
        this.notificationService.error(err.message, 'Senha');
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
