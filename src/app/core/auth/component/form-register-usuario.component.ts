import { Component, inject, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { email, form, FormField, maxLength, minLength, required, submit, validate } from '@angular/forms/signals';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { IUsuarioRequest } from '../../../features/usuario/models/usuario.model';
import { UsuarioService } from '../../../features/usuario/services/usuario.service';
import { LoginStateService } from '../services/login-state.service';
import { HeaderLoginComponent } from './header-login.component';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../shared/service/toast.service';
import { FieldWrapperComponent } from '../../../shared/layout/component/field-wrapper.component';

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
  template: `
    <div class="w-full max-w-xl flex flex-col bg-white rounded-xl shadow-lg p-8 ">
      <!-- Permite a injeção do componente HeaderLogin neste ponto-->
      <app-header-login title="Bem vindo" subtitle="Insira as informações e confirme o cadastro." />

      <form (submit)="onSubmit($event)" autocomplete="off" class="flex flex-col gap-2 w-full">
        <div class="flex flex-col gap-1.5">
          <app-field-wrapper [field]="registerFormLogin.name()">
            <!--Campo Name-->
            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <mat-label>Nome Completo</mat-label>
              <input
                matInput
                [formField]="registerFormLogin.name"
                autocomplete="off"
                placeholder="Ex: Jonh River"
              />
            </mat-form-field>
          </app-field-wrapper>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <app-field-wrapper [field]="registerFormLogin.userName()">
            <!--Campo userName-->
            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <mat-label>Login</mat-label>
              <input
                matInput
                [formField]="registerFormLogin.userName"
                autocomplete="off"
                placeholder="Ex: jonh.river"
              />
            </mat-form-field>
          </app-field-wrapper>
          <!--        </div>-->

          <!--        <div class="flex flex-col gap-1.5">-->
          <app-field-wrapper [field]="registerFormLogin.email()">
            <!--Campo userName-->
            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <mat-label>E-mail</mat-label>
              <input
                type="text"
                matInput
                [formField]="registerFormLogin.email"
                autocomplete="off"
                placeholder="Ex: jonhriver@gmail.com"
              />
            </mat-form-field>
          </app-field-wrapper>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <app-field-wrapper [field]="registerFormLogin.password()">
            <!--Campo password-->
            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <mat-label>Senha</mat-label>
              <input
                [type]="hidePassword() ? 'password' : 'text'"
                matInput
                [formField]="registerFormLogin.password"
                autocomplete="new-password"
              />
              <button
                class="!mr-2 text-gray-500 hover:text-gray-700"
                mat-icon-button
                matSuffix
                tabIndex="-1"
                type="button"
                aria-label="Ocultar/Exibir senha"
                (click)="togglePassword($event)"
              >
                <mat-icon class="transition-transform duration-200 hover:scale-110">
                  {{ hidePassword() ? 'visibility_off' : 'visibility' }}
                </mat-icon>
              </button>
            </mat-form-field>
          </app-field-wrapper>

          <app-field-wrapper [field]="registerFormLogin.confirmPassword!()">
            <!--Campo confirm password-->
            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <mat-label>Confirmar Senha</mat-label>
              <input
                [type]="hideConfirm() ? 'password' : 'text'"
                matInput
                [formField]="registerFormLogin.confirmPassword!"
                autocomplete="new-password"
              />
              <button
                class="!mr-2 text-gray-500 hover:text-gray-700"
                mat-icon-button
                matSuffix
                tabIndex="-1"
                type="button"
                aria-label="Ocultar/Exibir senha"
                (click)="toggleConfirm($event)"
              >
                <mat-icon class="transition-transform duration-200 hover:scale-110">
                  {{ hideConfirm() ? 'visibility_off' : 'visibility' }}
                </mat-icon>
              </button>
            </mat-form-field>
          </app-field-wrapper>
        </div>

        <div class="flex flex-col gap-1.5">
          <div class="flex justify-end items-center">
            <a
              tabindex="-1"
              routerLink="/auth/login"
              class="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >Já é cadastrado?</a
            >
          </div>
        </div>

        <button
          type="submit"
          [disabled]="registerFormLogin().invalid()"
          class="mt-4 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg
                hover:bg-blue-700 transition-all disabled:opacity-70 flex
                justify-center items-center gap-2 h-12"
        >
          @if (isLoading()) {
            <mat-spinner diameter="20" color="accent"></mat-spinner>
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
  private readonly toastService = inject(ToastService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly loginStateService = inject(LoginStateService);

  //Signals
  isLoading = signal<boolean>(false);
  // errorMessage = signal<string>('');

  // Signals para exibir/ocultar senha/confirmar senha
  hidePassword = signal<boolean>(true);
  hideConfirm = signal<boolean>(true);

  // Modelo do formulário para cadastro
  registerFormModel = signal<IUsuarioRequest>({
    name: '',
    userName: '',
    password: '',
    confirmPassword: '',
    email: '',
    activated: true,
    permissions: ['guest']
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
    // validate(path.confirmPassword!, (fieldContext: any) => {
    //   // Pegamos o valor que está no campo 'password' original
    //   const currentValue = fieldContext.value();
    //   const originalPassword = this.registerFormModel().password;
    //
    //   // Se a confirmação for diferente da original, retornamos o erro
    //   if (currentValue !== originalPassword) {
    //     return {
    //       kind: 'passwordMismatch', // Um identificador único para o erro
    //       message: 'As senhas não conferem'
    //     };
    //   }
    //   // Se forem iguais, retornamos null (significa que passou na validação!)
    //   return null;
    // });
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
      this.usuarioService.register(payload).subscribe({
        next: (response) => {
          this.isLoading.set(false);

          // Atualiza o signal do service com o nome do usuário recém-cadastrado
          this.loginStateService.newUserName.set(response.userName);

          this.toastService.successLogin('Register',
            `Usuário <strong>${response.userName}<strong> cadastrado.`);

        },
        error: (err) => {
          this.isLoading.set(false);
          // this.errorMessage.set(err.message);
          this.toastService.errorLogin('Register', err.message);
          console.error(err.message);
        }
      });
    });
  }
}
