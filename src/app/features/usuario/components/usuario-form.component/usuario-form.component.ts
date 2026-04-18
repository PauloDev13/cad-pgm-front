import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import {
  disabled,
  email,
  form,
  FormField,
  maxLength,
  minLength,
  required,
  submit,
  validate
} from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { IUsuarioRequest, IUsuarioResponse } from '../../models/usuario.model';
import { UsuarioService } from '../../services/usuario.service';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FieldWrapperComponent } from '../../../../shared/layout/component/field-wrapper.component';
import { NotificationService } from '../../../../shared/service/NotificationSnackbar.service';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
  selector: 'app-usuario-form.component',
  imports: [
    FormField,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    FieldWrapperComponent,
    MatCheckbox
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title class="!font-bold !text-xl !pb-0 !text-blue-700">
      {{ isEdit ? 'Editar Usuário' : 'Novo Usuário' }}
    </h2>
    <button
      mat-icon-button
      mat-dialog-close
      aria-label="Fechar"
      class="!absolute !top-3 !right-3 !w-8 !h-8 !flex !items-center !justify-center
            !bg-blue-600 hover:!bg-blue-500 !transition-transform !duration-300
             !ease-in-out hover:!scale-105"
    >
      <mat-icon class="!text-white !scale-75">close</mat-icon>
    </button>
    <mat-dialog-content class="!pt-2 !pb-0">
      <form autocomplete="off" class="flex flex-col gap-2">
        <div>
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Dados do cadastro
          </h3>

          <app-field-wrapper [field]="usuarioForm.name()">
            <!--Campo nome-->
            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <mat-label>Nome Completo</mat-label>
              <input matInput [formField]="usuarioForm.name" placeholder="Ex: João da Silva" />
            </mat-form-field>
          </app-field-wrapper>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <!--Campo Login-->
            <app-field-wrapper [field]="usuarioForm.userName()">
              <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                <mat-label>Login (User Name)</mat-label>
                <input matInput [formField]="usuarioForm.userName" />
              </mat-form-field>
            </app-field-wrapper>

            <!--Campo E-mail-->
            <app-field-wrapper [field]="usuarioForm.email()">
              <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                <mat-label>E-Mail</mat-label>
                <input matInput [formField]="usuarioForm.email" />
              </mat-form-field>
            </app-field-wrapper>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-[70%_30%] gap-3">
            <!--Campo Permissões-->
            <mat-form-field
              appearance="outline"
              class="w-full"
              floatLabel="always"
              subscriptSizing="dynamic"
            >
              <mat-label>Roles</mat-label>
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

            <!--Campo Ativo-->
            <mat-checkbox [formField]="usuarioForm.activated">
              <span class="-ml-2">Usuário Ativo</span>
            </mat-checkbox>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 mt-6 gap-3">
            <app-field-wrapper class="mb-1" [field]="usuarioForm.password()">
              <!--Campo Senha-->
              <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                <mat-label>Senha</mat-label>
                <input
                  autocomplete="new-password"
                  [type]="hidePassword() ? 'password' : 'text'"
                  matInput
                  [formField]="usuarioForm.password"
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

            <app-field-wrapper [field]="usuarioForm.confirmPassword!()">
              <!--Campo Senha-->
              <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                <mat-label>Confirmar Senha</mat-label>
                <input
                  autocomplete="new-password"
                  [type]="hideConfirm() ? 'password' : 'text'"
                  matInput
                  [formField]="usuarioForm.confirmPassword!"
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

            <app-field-wrapper [field]="usuarioForm.forcePasswordChange!()">
              <mat-checkbox [formField]="usuarioForm.forcePasswordChange!">
                <span class="-ml-2">Trocar Senha</span>
              </mat-checkbox>
            </app-field-wrapper>
          </div>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="!pt-0 !pb-6 !pr-6">
      <button
        mat-flat-button
        class="!transition-transform duration-300 !ease-in-out hover:!scale-105"
        (click)="salvar()"
        [disabled]="usuarioForm().invalid()"
      >
        <mat-icon class="!mr-0.5">save</mat-icon>
        {{ isEdit ? 'Atualizar' : 'Salvar' }}
      </button>
    </mat-dialog-actions>
  `
})
export class UsuarioFormComponent implements OnInit {
  // Injeções de dependência
  private readonly usuarioService = inject(UsuarioService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialogRef = inject(MatDialogRef<UsuarioFormComponent>);

  isEdit: boolean = false;
  readonly data = inject<IUsuarioResponse>(MAT_DIALOG_DATA, { optional: true });
  // Signals para armazenar os dados que virão da API
  usuarios = signal<IUsuarioResponse[]>([]);
  roles = signal<string[]>([]);
  // Signals para exibir/ocultar senha/confirmar senha
  hidePassword = signal<boolean>(true);
  hideConfirm = signal<boolean>(true);
  // Modelo do formulário para cadastro
  userFormModel = signal<IUsuarioRequest>({
    name: '',
    userName: '',
    password: '',
    confirmPassword: '',
    email: '',
    activated: true,
    permissions: ['guest'],
    forcePasswordChange: false
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

    disabled(path.password, () => this.isEdit);
    disabled(path.confirmPassword, () => this.isEdit);

    required(path.password, { message: 'Senha é obrigatória' });
    minLength(path.password, 6, { message: 'Senha deve ter no mínimo 6 caracteres' });

    // Validação dinâmica do confirmar senha
    validate(path.confirmPassword!, ({ value, valueOf }) => {
      // Se for edição, passa direto
      if (this.isEdit) return null;

      // captura o valor que está no input confirmPassword
      const confirm = value();
      // captura o valor que está no input password
      const password = valueOf(path.password);

      // se o input estiver vazio, retorna o erro required com a mensagem
      if (!confirm) {
        return { kind: 'required', message: 'Confirme a Senha' };
      }
      // se os inputs tiverem valores diferente,retorna o erro passwordMismatch com a mensagem
      if (confirm !== password) {
        return { kind: 'passwordMismatch', message: 'As senhas não conferem' };
      }

      // se tudo está certo, retorna null
      return null;
    });

    // E-mail
    required(path.email, { message: 'E-mail é obrigatório' });
    email(path.email, { message: 'E-mail inválido' });
  });

  ngOnInit() {
    this.loadRoles();

    this.isEdit = !!this.data;

    if (this.isEdit && this.data) {
      this.userFormModel.update((u: IUsuarioRequest) => ({
        ...u,
        ...this.data
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

        // Cria o objeto payload sem o atributo confirmPassword
        const { confirmPassword, ...payload } = requestData;

        // Transformamos as chamadas Observable em Promise com firstValueFrom
        if (this.isEdit) {
          // se é edição, retira os campos senha e confirme senha

          // se for edição e a opção trocar senha estiver MARCADA,
          if (payload.forcePasswordChange) {
            // cria uma senha padrão
            payload.password = 'pgm@1234';
            // usa o endpoint de atualização com PUT
            await firstValueFrom(this.usuarioService.updatePut(this.data!.id, payload));
          } else {
            // se for edição e a opção trocar senha estiver DESMARCADA,
            // Cria o objeto payloadPatch sem o atributo senha, pois ela não deve ser alterada
            const { password, ...payloadPatch } = payload;
            // usa o endpoint de atualização com PATCH
            await firstValueFrom(this.usuarioService.updatePatch(this.data!.id, payloadPatch));
          }
        } else {
          // se não é edição, cria uma senha padrão para um novo usuário
          payload.password = 'pgm@1234';
          await firstValueFrom(this.usuarioService.create(payload));
        }

        this.notificationService.success(
          `Usuário ${this.isEdit ? 'atualizado' : 'cadastrado'} com sucesso!`,
          `${this.isEdit ? 'Atualização' : 'Cadastro'}`
        );

        this.dialogRef.close(true);
      } catch (err: any) {
        console.error('Erro inesperado', err.message);
        // chama a função customizada de tratamento de erro passando o erro
        // this.apiErrorHandlerService.errorHandler(err);
      }
    });
  }

  // Métodos para alternar a visualização do ícone do "olhinho" nos inputs senha e confirme senha
  togglePassword(event: MouseEvent) {
    event.preventDefault(); // Evita que o formulário submeta ao clicar no botão do ícone
    this.hidePassword.set(!this.hidePassword());
  }

  toggleConfirm(event: MouseEvent) {
    event.preventDefault();
    this.hideConfirm.set(!this.hideConfirm());
  }

  // lê as permissões e seta o signal com o array
  loadRoles() {
    this.usuarioService.getRoles().subscribe((res) => this.roles.set(res.roles));
  }
}
