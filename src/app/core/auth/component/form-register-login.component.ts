import { Component, input, output } from '@angular/core';
import { FormErrorComponent } from '../../../shared/components/form-error/form-error.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormField } from '@angular/forms/signals';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-form-register-login',
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
            <input type="password" matInput [formField]="loginCadForm().password" />
          </mat-form-field>
          <!--Chama o componente customizado para exibir os erros-->
          <app-form-error [field]="loginCadForm().password()" />

          <!--Campo password-->
          <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
            <mat-label>Confirmar Senha</mat-label>
            <input type="password" matInput />
          </mat-form-field>
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

  // Outputs
  onRegisterSubmit = output<void>();
  onRegisterLogin = output<boolean>();

  save(event: Event) {
    event.preventDefault();
    this.onRegisterSubmit.emit();
  }

  goToLogin(event: Event) {
    event.preventDefault();
    this.onRegisterLogin.emit(true);
  }
}
