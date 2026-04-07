import { Component, input, output, signal } from '@angular/core';
import { FormErrorComponent } from '../../../shared/components/form-error/form-error.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormField } from '@angular/forms/signals';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-form-register-login',
  imports: [
    FormErrorComponent,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    FormField,
  ],
  standalone: true,
  template: `
    <div class="w-full max-w-md flex flex-col">
      <!-- Permite a injeção do componente HeaderLogin neste ponto-->
      <ng-content />

      <form (submit)="save($event)" class="flex flex-col gap-5 w-full">
        <div class="flex flex-col gap-1.5">
          <!--Campo Name-->
          <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
            <mat-label>Nome Completo</mat-label>
            <input matInput [formField]="loginCadForm().name" placeholder="Ex: Jonh River" />
          </mat-form-field>
          <!--Chama o componente customizado para exibir os erros-->
          <app-form-error [field]="loginCadForm().name()" />

          <!--Campo userName-->
          <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
            <mat-label>Login</mat-label>
            <input matInput [formField]="loginCadForm().userName" placeholder="Ex: jonh.river" />
          </mat-form-field>
          <!--Chama o componente customizado para exibir os erros-->
          <app-form-error [field]="loginCadForm().userName()" />

          <!--Campo userName-->
          <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
            <mat-label>E-mail</mat-label>
            <input
              type="text"
              matInput
              [formField]="loginCadForm().email"
              placeholder="Ex: jonhriver@gmail.com"
            />
          </mat-form-field>
          <!--Chama o componente customizado para exibir os erros-->
          <app-form-error [field]="loginCadForm().email()" />

          <!--Campo password-->
          <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
            <mat-label>Senha</mat-label>
            <input
              [type]="hidePassword() ? 'password' : 'text'"
              matInput
              [formField]="loginCadForm().password"
            />
            <button
              class="!mr-2 text-gray-500 hover:text-gray-700"
              mat-icon-button
              matSuffix
              type="button"
              aria-label="Ocultar/Exibir senha"
              (click)="togglePassword($event)"
            >
              <mat-icon class="transition-transform duration-200 hover:scale-110">
                {{ hidePassword() ? 'visibility_off' : 'visibility' }}
              </mat-icon>
            </button>
          </mat-form-field>
          <!--Chama o componente customizado para exibir os erros-->
          <app-form-error [field]="loginCadForm().password()" />

          <!--Campo confirm password-->
          <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
            <mat-label>Confirmar Senha</mat-label>
            <input
              [type]="hideConfirm() ? 'password' : 'text'"
              matInput
              [formField]="loginCadForm().confirmPassword"
            />
            <button
              class="!mr-2 text-gray-500 hover:text-gray-700"
              mat-icon-button
              matSuffix
              type="button"
              aria-label="Ocultar/Exibir senha"
              (click)="toggleConfirm($event)"
            >
              <mat-icon class="transition-transform duration-200 hover:scale-110">
                {{ hidePassword() ? 'visibility_off' : 'visibility' }}
              </mat-icon>
            </button>
          </mat-form-field>
          <app-form-error [field]="loginCadForm().confirmPassword()" />
        </div>

        <div class="flex flex-col gap-1.5">
          <div class="flex justify-end items-center">
            <a
              href="#"
              (click)="goToLogin($event)"
              class="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >Já é cadastrado?</a
            >
          </div>
        </div>

        <button
          type="submit"
          [disabled]="isInvalid() || isLoading()"
          class="mt-4 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-70 flex justify-center items-center gap-2 h-12"
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
  `,
})
export class FormRegisterLoginComponent {
  // Inputs
  loginCadForm = input.required<any>();
  isLoading = input.required<boolean>();
  isInvalid = input.required<boolean>();

  // Signals para exibir/ocultar senha/confirmar senha
  hidePassword = signal<boolean>(true);
  hideConfirm = signal<boolean>(true);

  // Outputs
  onRegisterSubmit = output<void>();
  onRegisterLogin = output<boolean>();

  // Métodos para alternar a visualização
  togglePassword(event: MouseEvent) {
    event.preventDefault(); // Evita que o formulário submeta ao clicar no botão do ícone
    this.hidePassword.set(!this.hidePassword());
  }

  toggleConfirm(event: MouseEvent) {
    event.preventDefault();
    this.hideConfirm.set(!this.hideConfirm());
  }

  save(event: Event) {
    event.preventDefault();
    this.onRegisterSubmit.emit();
  }

  goToLogin(event: Event) {
    event.preventDefault();
    this.onRegisterLogin.emit(true);
  }
}
