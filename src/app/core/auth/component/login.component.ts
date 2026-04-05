import { Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth-service';
import { Router } from '@angular/router';
import { IFormLoginModel } from '../models/auth.model';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { FormErrorComponent } from '../../../shared/components/form-error/form-error.component';
import { MatFormField } from '@angular/material/form-field';
import { MatInput, MatLabel } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  imports: [
    MatIconModule,
    ReactiveFormsModule,
    FormErrorComponent,
    MatFormField,
    MatInput,
    MatLabel,
    FormField,
    MatProgressSpinner,
  ],
  standalone: true,
  // template: `
  //   <div class="min-h-screen flex w-full bg-white text-gray-800">
  //     <div class="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-24">
  //       <div class="w-full max-w-md flex flex-col">
  //         <div class="flex items-center gap-3 mb-8">
  //           <mat-icon class="text-blue-600 !h-8 !w-8 !text-3xl">corporate_fare</mat-icon>
  //           <span class="text-2xl font-bold text-gray-800 tracking-tight">
  //             Sistema
  //             <span class="text-blue-600">de Gerenciamento</span>
  //           </span>
  //         </div>
  //
  //         <h1 class="text-3xl font-bold text-gray-900 mb-2">Bem-vindo de volta</h1>
  //         <p class="text-gray-500 mb-8">Insira suas credenciais para acessar o painel.</p>
  //
  //         <div class="flex flex-col gap-5 w-full">
  //           @if (errorMessage()) {
  //             <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
  //               <p class="text-sm text-red-700 font-medium">{{ errorMessage() }}</p>
  //             </div>
  //           }
  //
  //           <div class="flex flex-col gap-1.5">
  //             <!--Campo userName-->
  //             <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
  //               <mat-label>Nome do Usuário</mat-label>
  //               <input matInput [formField]="loginForm.userName" placeholder="Ex: jonh.river" />
  //             </mat-form-field>
  //
  //             <!--Chama o componente customizado para exibir os erros-->
  //             <app-form-error [field]="loginForm.userName()" />
  //             <!--Campo password-->
  //             <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
  //               <mat-label>Senha</mat-label>
  //               <input type="password" matInput [formField]="loginForm.password" />
  //             </mat-form-field>
  //             <!--Chama o componente customizado para exibir os erros-->
  //             <app-form-error [field]="loginForm.password()" />
  //           </div>
  //
  //           <div class="flex flex-col gap-1.5">
  //             <div class="flex justify-between items-center">
  //               <a
  //                 href="#"
  //                 class="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
  //                 >Esqueceu a senha?</a
  //               >
  //             </div>
  //           </div>
  //
  //           <button
  //             type="button"
  //             (click)="onSubmit()"
  //             [disabled]="!loginForm().valid()"
  //             class="mt-4 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-70 flex justify-center items-center gap-2 h-12"
  //           >
  //             @if (isLoading()) {
  //               <mat-spinner diameter="20" color="accent"></mat-spinner>
  //               <span>Autenticando...</span>
  //             } @else {
  //               <span>Entrar no Sistema</span>
  //             }
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //
  //     <div
  //       class="hidden lg:flex w-1/2 bg-blue-50 flex-col items-center justify-center relative overflow-hidden"
  //     >
  //       <div class="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-800"></div>
  //
  //       <div class="relative z-10 text-center p-12 text-white">
  //         <h2 class="text-4xl font-bold mb-4">Gestão inteligente e segura.</h2>
  //         <p class="text-lg text-blue-100 max-w-md mx-auto">
  //           Controle total sobre as permissões e dados dos servidores do seu departamento em uma
  //           única plataforma.
  //         </p>
  //       </div>
  //     </div>
  //   </div>
  // `,

  // TEMPLATE
  template: `
    <div class="min-h-screen flex w-full bg-white">
      <div class="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-24">
        <div class="w-full max-w-md flex flex-col">
          <div class="flex items-center gap-3 mb-8">
            <mat-icon class="text-blue-600 !h-8 !w-8 !text-3xl">corporate_fare</mat-icon>
            <span class="text-2xl font-bold text-gray-800 tracking-tight">
              Sistema
              <span class="text-blue-600">de Gerenciamento</span>
            </span>
          </div>

          <h1 class="text-3xl font-bold text-gray-900 mb-2">Bem-vindo de volta</h1>
          <p class="text-gray-500 mb-8">Insira suas credenciais para acessar o painel.</p>

          <!--          <div-->
          <!--            class="h-64 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400"-->
          <!--          >-->
          <div class="flex flex-col gap-5 w-full">
            @if (errorMessage()) {
              <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <p class="text-sm text-red-700 font-medium">{{ errorMessage() }}</p>
              </div>
            }

            <div class="flex flex-col gap-1.5">
              <!--Campo userName-->
              <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                <mat-label>Nome do Usuário</mat-label>
                <input matInput [formField]="loginForm.userName" placeholder="Ex: jonh.river" />
              </mat-form-field>

              <!--Chama o componente customizado para exibir os erros-->
              <app-form-error [field]="loginForm.userName()" />
              <!--Campo password-->
              <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                <mat-label>Senha</mat-label>
                <input type="password" matInput [formField]="loginForm.password" />
              </mat-form-field>
              <!--Chama o componente customizado para exibir os erros-->
              <app-form-error [field]="loginForm.password()" />
            </div>

            <div class="flex flex-col gap-1.5">
              <div class="flex justify-between items-center">
                <a
                  href="#"
                  class="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >Esqueceu a senha?</a
                >
              </div>
            </div>

            <button
              type="button"
              (click)="onSubmit()"
              [disabled]="!loginForm().valid()"
              class="mt-4 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-70 flex justify-center items-center gap-2 h-12"
            >
              @if (isLoading()) {
                <mat-spinner diameter="20" color="accent"></mat-spinner>
                <span>Autenticando...</span>
              } @else {
                <span>Entrar no Sistema</span>
              }
            </button>
          </div>
        </div>
        <!--        </div>-->
      </div>

      <div
        class="hidden lg:flex w-1/2 bg-blue-50 flex-col items-center justify-center
               relative overflow-hidden"
      >
        <div class="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-800"></div>

        <div class="relative z-10 text-center p-12 text-white">
          <h2 class="text-4xl font-bold mb-4">Gestão inteligente e segura.</h2>
          <p class="text-lg text-blue-100 max-w-md mx-auto">
            Controle total sobre as permissões e dados dos servidores do seu departamento em uma
            única plataforma.
          </p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  isLoading = signal<boolean>(false);
  errorMessage = signal('');
  formLoginModel = signal<IFormLoginModel>({
    userName: '',
    password: '',
  });
  loginForm = form(this.formLoginModel, (path) => {
    required(path.userName, { message: 'Nome do usuário é obrigatório' });
    required(path.password, { message: 'A senha é obrigatório' });
  });
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  async onSubmit() {
    this.isLoading.set(true);
    await submit(this.loginForm, async () => {
      const dataLogin = this.loginForm().value();
      console.log(dataLogin);
      this.authService.login(dataLogin).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['home']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.message);
        },
      });
    });
  }
}
