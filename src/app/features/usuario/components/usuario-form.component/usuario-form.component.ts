import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import {
  email,
  form,
  FormField,
  maxLength,
  minLength,
  required,
  submit,
  validate,
} from '@angular/forms/signals';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { ToastService } from '../../../../shared/service/toast.service';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { IUsuarioRequest, IUsuarioResponse } from '../../models/usuario.model';
import { UsuarioService } from '../../services/usuario.service';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormErrorComponent } from '../../../../shared/components/form-error/form-error.component';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-usuario-form.component',
  imports: [
    FormField,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormErrorComponent,
    MatSelectModule,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title class="!font-bold !text-xl !pb-0">
      {{ isEdit ? 'Editar Usuário' : 'Novo Usuário' }}
    </h2>
    <button
      mat-icon-button
      mat-dialog-close
      aria-label="Fechar"
      class="!absolute !top-3 !right-6 !w-8 !h-8 !flex !items-center !justify-center
            !bg-blue-600 hover:!bg-blue-500 !transition-transform !duration-300
             !ease-in-out hover:!scale-105"
    >
      <mat-icon class="!text-white !scale-75">close</mat-icon>
    </button>
    <mat-dialog-content class="!pt-4">
      <form autocomplete="off" class="flex flex-col gap-2">
        <div>
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Dados do cadastro
          </h3>

          <div class="grid grid-cols-1 gap-3">
            <div class="flex flex-col relative pb-5">
              <!--Campo nome-->
              <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                <mat-label>Nome Completo</mat-label>
                <input matInput [formField]="usuarioForm.name" placeholder="Ex: João da Silva" />
              </mat-form-field>

              <!--Chama o componente customizado para exibir os erros-->
              <app-form-error [field]="usuarioForm.name()" />
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
            <div class="flex flex-col relative pb-5">
              <!--Campo Login-->
              <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                <mat-label>Login (User Name)</mat-label>
                <input matInput [formField]="usuarioForm.userName" />
              </mat-form-field>

              <!--Chama o componente customizado para exibir os erros-->
              <app-form-error [field]="usuarioForm.userName()" />
            </div>

            <div class="flex flex-col relative pb-5">
              <!--Campo E-mail-->
              <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                <mat-label>E-Mail</mat-label>
                <input matInput [formField]="usuarioForm.email" />
              </mat-form-field>
              <!--Chama o componente customizado para exibir os erros-->
              <app-form-error [field]="usuarioForm.email()" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            <div class="flex flex-col">
              <mat-form-field
                appearance="outline"
                class="w-full"
                floatLabel="always"
                subscriptSizing="dynamic"
              >
                <mat-label>Permissões de Acesso</mat-label>
                <mat-select
                  multiple="true"
                  placeholder="Adicione permissões de acesso"
                  [formField]="usuarioForm.permissions"
                >
                  @for (role of roles(); track role) {
                    <mat-option [value]="role">{{ role }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>
            <div class="flex flex-col">
              <div class=" flex justify-end gap-2">
                <button
                  mat-stroked-button
                  type="button"
                  mat-dialog-close
                  class="!border-blue-600 !text-blue-600 !transition-transform
                        duration-300 !ease-in-out hover:!scale-105"
                >
                  <mat-icon>close</mat-icon>
                  Alterar Senha
                </button>
                <button
                  mat-flat-button
                  class="!transition-transform duration-300 !ease-in-out hover:!scale-105"
                  (click)="salvar()"
                  [disabled]="usuarioForm().invalid()"
                >
                  <mat-icon class="!mr-0.5">save</mat-icon>
                  {{ isEdit ? 'Atualizar' : 'Salvar' }}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div></div>
      </form>
    </mat-dialog-content>
  `,
})
export class UsuarioFormComponent implements OnInit {
  isEdit: boolean = false;
  readonly data = inject<IUsuarioResponse>(MAT_DIALOG_DATA, { optional: true });

  // Signals para armazenar os dados que virão da API
  usuarios = signal<IUsuarioResponse[]>([]);
  roles = signal<string[]>([]);

  // Modelo do formulário para cadastro
  userFormModel = signal<IUsuarioRequest>({
    name: '',
    userName: '',
    password: '',
    confirmPassword: '',
    email: '',
    activated: true,
    permissions: ['guest'],
  });

  // Formulário de cadastro com validações
  usuarioForm = form(this.userFormModel, (path: any) => {
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
    validate(path.confirmPassword!, (fieldContext: any) => {
      // Pegamos o valor que está no campo 'password' original
      const currentValue = fieldContext.value();
      const originalPassword = this.userFormModel().password;

      // Se a confirmação for diferente da original, retornamos o erro
      if (currentValue !== originalPassword) {
        return {
          kind: 'passwordMismatch', // Um identificador único para o erro
          message: 'As senhas não conferem',
        };
      }
      // Se forem iguais, retornamos null (significa que passou na validação!)
      return null;
    });
    // E-mail
    required(path.email, { message: 'E-mail é obrigatório' });
    email(path.email, { message: 'E-mail inválido' });
  });

  // protected readonly form = form;
  private readonly usuarioService = inject(UsuarioService);
  private readonly authService = inject(AuthService);

  // Computed
  isPermissionsButtonHidden = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return;
    return user.roles.some((p) => p === 'admin');
  });

  private readonly toastService = inject(ToastService);
  private readonly dialogRef = inject(MatDialogRef<UsuarioFormComponent>);

  ngOnInit() {
    this.loadRoles();

    this.isEdit = !!this.data;

    if (this.isEdit && this.data) {
      this.userFormModel.update((u) => ({
        ...u,
        ...this.data,
      }));
    }
  }

  // Salva ou Atualiza um registro com todos os dados de um funcionário
  async salvar() {
    // e checa o valid() automaticamente antes de engatilhar o callback.
    await submit(this.usuarioForm, async () => {
      try {
        // Obtemos os valores diretos do Signal de Modelo Atualizado
        const requestData = this.userFormModel() as IUsuarioRequest;

        // Transformamos as chamadas Observable em Promise com firstValueFrom
        if (this.isEdit) {
          await firstValueFrom(this.usuarioService.update(this.data!.id, requestData));
        } else {
          await firstValueFrom(this.usuarioService.create(requestData));
        }

        this.toastService.success(
          `Usuário ${this.isEdit ? 'atualizado' : 'cadastrado'} com sucesso!`,
        );

        this.dialogRef.close(true);
      } catch (error: any) {
        // Mensagem padrão caso seja erro de rede (backend fora do ar) ou algo não mapeado
        let messageDefaultErro = 'Erro inesperado ao conectar a API';

        // Verificamos se o erro veio da requisição HTTP
        if (error instanceof HttpErrorResponse) {
          // Tratamento 1: O Spring devolveu um JSON com a propriedade "message"
          if (error.error && typeof error.error.message === 'string') {
            messageDefaultErro = error.error.message;
            // Tratamento 2: O Spring devolveu apenas uma String simples no corpo da resposta
          } else if (error.error && Array.isArray(error.error.errors)) {
            messageDefaultErro =
              error.error.errors[0].defaultMessage || 'Erro de validação nos dados enviados.';
          }
          // Tratamento 3: Erro de Validação de Múltiplos Campos (@Valid do Spring)
          // (Às vezes o Spring mapeia os erros em um array chamado "errors")
          else if (error.error && Array.isArray(error.error.errors)) {
            messageDefaultErro =
              error.error.errors[0].defaultMessage || 'Erro de validação nos dados enviados.';
          }
        }
        this.toastService.error(messageDefaultErro);
      }
    });
  }

  loadRoles() {
    this.usuarioService.getRoles().subscribe((res) => this.roles.set(res.roles));
  }
}
