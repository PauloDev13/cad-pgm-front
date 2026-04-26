import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { email, form, FormField, maxLength, minLength, required, submit, validate } from '@angular/forms/signals';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TRegisterNewUser } from '../../../features/usuario/models/usuario.model';
import { LoginStateService } from '../services/login-state.service';
import { HeaderLoginComponent } from './header-login.component';
import { Router, RouterLink } from '@angular/router';
import { FieldWrapperComponent } from '../../../shared/layout/component/field-wrapper.component';
import { NotificationService } from '../../../shared/service/NotificationSnackbar.service';
import { AuthService } from '../services/auth.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-form-register-login',
  imports: [
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    FormField,
    HeaderLoginComponent,
    RouterLink,
    FieldWrapperComponent
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="w-full flex flex-col bg-white rounded-xl shadow-xl p-6 sm:p-8 border border-gray-100 lg:border-none lg:shadow-lg">
      <app-header-login title="Bem-vindo" subtitle="Insira as informações e confirme o cadastro." />

      <form (submit)="onSubmit($event)" autocomplete="off" class="flex flex-col w-full gap-y-3">

        <app-field-wrapper [field]="registerFormLogin.name()">
          <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
            <mat-label>Nome Completo</mat-label>
            <input matInput [formField]="registerFormLogin.name" autocomplete="off" placeholder="Ex: Jonh River" />
          </mat-form-field>
        </app-field-wrapper>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-3">
          <app-field-wrapper [field]="registerFormLogin.userName()">
            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <mat-label>Login</mat-label>
              <input matInput [formField]="registerFormLogin.userName" autocomplete="off"
                     placeholder="Ex: jonh.river" />
            </mat-form-field>
          </app-field-wrapper>

          <app-field-wrapper [field]="registerFormLogin.email()">
            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <mat-label>E-mail</mat-label>
              <input type="text" matInput [formField]="registerFormLogin.email" autocomplete="off"
                     placeholder="Ex: jonhriver@gmail.com" />
            </mat-form-field>
          </app-field-wrapper>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-3">
          <app-field-wrapper [field]="registerFormLogin.password()">
            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <mat-label>Senha</mat-label>
              <input [type]="hidePassword() ? 'password' : 'text'" matInput [formField]="registerFormLogin.password"
                     autocomplete="new-password" />
              <button class="!mr-1 text-gray-500 hover:text-gray-700" mat-icon-button matSuffix tabIndex="-1"
                      type="button" aria-label="Ocultar/Exibir senha" (click)="togglePassword($event)">
                <mat-icon class="transition-transform duration-200 hover:scale-110">
                  {{ hidePassword() ? 'visibility_off' : 'visibility' }}
                </mat-icon>
              </button>
            </mat-form-field>
          </app-field-wrapper>

          <app-field-wrapper [field]="registerFormLogin.confirmPassword!()">
            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <mat-label>Confirmar Senha</mat-label>
              <input [type]="hideConfirm() ? 'password' : 'text'" matInput
                     [formField]="registerFormLogin.confirmPassword!" autocomplete="new-password" />
              <button class="!mr-1 text-gray-500 hover:text-gray-700" mat-icon-button matSuffix tabIndex="-1"
                      type="button" aria-label="Ocultar/Exibir senha" (click)="toggleConfirm($event)">
                <mat-icon class="transition-transform duration-200 hover:scale-110">
                  {{ hideConfirm() ? 'visibility_off' : 'visibility' }}
                </mat-icon>
              </button>
            </mat-form-field>
          </app-field-wrapper>
        </div>

        <div class="flex justify-end items-center mb-4 px-1 mt-1">
          <a tabindex="-1" routerLink="/auth/login"
             class="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
            Já é cadastrado?
          </a>
        </div>

        <button
          type="submit"
          [disabled]="registerFormLogin().invalid() || isLoading()"
          class="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-all flex justify-center items-center gap-2 h-12 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          @if (isLoading()) {
            <mat-spinner diameter="20" class="custom-spinner"></mat-spinner>
            <span>Cadastrando...</span>
          } @else {
            <span>Confirmar Cadastro</span>
          }
        </button>
      </form>
    </div>
  `
})
export class FormRegisterUsuarioComponent {
  // Injeções
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);
  private readonly loginStateService = inject(LoginStateService);
  private readonly router = inject(Router);

  //Signals
  isLoading = signal<boolean>(false);
  // Signals para exibir/ocultar senha/confirmar senha
  hidePassword = signal<boolean>(true);
  hideConfirm = signal<boolean>(true);
  // Modelo do formulário para cadastro
  registerFormModel = signal<TRegisterNewUser>({
    name: '',
    userName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  // Formulário de cadastro com validações
  registerFormLogin = form(this.registerFormModel, (path: any) => {
    // Nome completo
    required(path.name, { message: 'Nome completo é obrigatório' });
    minLength(path.name, 5, { message: 'O Nome deve ter no mínimo 5 caracteres' });
    // Login
    required(path.userName, { message: 'login é obrigatório' });
    minLength(path.userName, 5, { message: 'O Login deve ter no mínimo 5 caracteres' });
    maxLength(path.userName, 30, { message: 'O Login deve ter no máximo 30 caracteres' });
    // Password
    required(path.password!, { message: 'Senha é obrigatória' });
    minLength(path.password!, 6, { message: 'Senha deve ter no mínimo 6 caracteres' });

    // ConfirmPassword
    required(path.confirmPassword!, { message: 'Confirme a Senha' });
    validate(path.confirmPassword!, ({ value, valueOf }) => {
      const confirm = value();
      const password = valueOf(path.password);

      if (confirm !== password) {
        return {
          kind: 'passwordMismatch', // Um identificador único para o erro
          message: 'As senhas não conferem'
        };
      }
      return null;
    });

    // E-mail
    required(path.email, { message: 'E-mail é obrigatório' });
    email(path.email, { message: 'E-mail inválido' });
  });

  // Métodos para alternar a visualização
  togglePassword(event: MouseEvent) {
    event.preventDefault(); // Evita que o formulário submeta ao clicar no botão do ícone
    this.hidePassword.set(!this.hidePassword());
  }

  toggleConfirm(event: MouseEvent) {
    event.preventDefault();
    this.hideConfirm.set(!this.hideConfirm());
  }

  async onSubmit(event: Event) {
    event.preventDefault();
    this.isLoading.set(true);

    await submit(this.registerFormLogin, async () => {
      // pega os valores de todos os campos do fomulário
      const dataRegister = this.registerFormLogin().value();

      // Retira o campo confirmPassword do objeto que será enviado para o backend
      const { confirmPassword, ...payload } = dataRegister;

      // Chama o service para realizar enviar os dados de cadastro
      this.authService.registerNewUserPublic(payload).pipe(
        finalize(() => this.isLoading.set(false))
      ).subscribe({
        next: (response) => {
          this.isLoading.set(false);

          // Atualiza o signal do service com o nome do usuário recém-cadastrado
          this.loginStateService.newUserName.set(response.userName);

          this.notificationService.success(
            `Usuário <strong>${response.userName}</strong> cadastrado.`,
            'Register'
          );

          // Redireciona o novo usuário para a tela de login
          this.router.navigate(['/auth/login']).then();
        },
        error: (err: Error) => {
          // this.isLoading.set(false);
          this.notificationService.error(err.message, 'Register');
        }
      });
    });
  }
}
