import { Component, input, output } from '@angular/core';
import { FormErrorComponent } from '../../../shared/components/form-error/form-error.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormField } from '@angular/forms/signals';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-form-main-login',
  imports: [
    FormErrorComponent,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    FormField,
  ],
  standalone: true,
  template: `
    <div class="w-full max-w-md flex flex-col">
      <!-- Permite a injeção do componente HeaderLogin neste ponto-->
      <ng-content />

      <form (submit)="login($event)" class="flex flex-col gap-5 w-full">
        @if (errorMessage()) {
          <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <p class="text-sm text-red-700 font-medium">{{ errorMessage() }}</p>
          </div>
        }

        <div class="flex flex-col gap-1.5">
          <!--Campo userName-->
          <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
            <mat-label>Nome do Usuário</mat-label>
            <input matInput [formField]="loginForm().userName" placeholder="Ex: jonh.river" />
          </mat-form-field>

          <!--Chama o componente customizado para exibir os erros-->
          <app-form-error [field]="loginForm().userName()" />
          <!--Campo password-->
          <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
            <mat-label>Senha</mat-label>
            <input type="password" matInput [formField]="loginForm().password" />
          </mat-form-field>
          <!--Chama o componente customizado para exibir os erros-->
          <app-form-error [field]="loginForm().password()" />
        </div>

        <div class="flex flex-col gap-1.5">
          <div class="flex justify-between items-center">
            <a
              href="#"
              class="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >Esqueceu a senha?</a
            >
            <a
              (click)="goToRegisterLogin($event)"
              href="#"
              class="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >Não é cadastrado?</a
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
            <span>Autenticando...</span>
          } @else {
            <span>Entrar no Sistema</span>
          }
        </button>
      </form>
    </div>
  `,
})
export class FormMainLoginComponent {
  // Inputs
  loginForm = input.required<any>();
  isLoading = input.required<boolean>();
  isInvalid = input.required<boolean>();
  errorMessage = input.required<string>();

  //Outputs
  onLoginSubmit = output<void>();
  onLogin = output<boolean>();

  login(event: Event) {
    event.preventDefault();
    this.onLoginSubmit.emit();
  }

  goToRegisterLogin(event: Event) {
    event.preventDefault();
    this.onLogin.emit(true);
  }
}
