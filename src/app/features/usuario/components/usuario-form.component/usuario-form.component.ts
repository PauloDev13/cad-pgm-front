import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { email, form, FormField, maxLength, minLength, required, submit } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { IUsuarioRequest, IUsuarioResponse, TUsuarioUpdate } from '../../models/usuario.model';
import { UsuarioService } from '../../services/usuario.service';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FieldWrapperComponent } from '../../../../shared/layout/component/field-wrapper.component';
import { NotificationService } from '../../../../shared/service/NotificationSnackbar.service';
import { MatCheckbox } from '@angular/material/checkbox';
import { customHttpError } from '../../../../shared/utils/custom-http-response-error';

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
    <div class="flex justify-between items-center px-6 pt-4 pb-1">
      <h2 mat-dialog-title class="!font-bold !text-xl !text-blue-700 !m-0 !p-0">
        {{ isEdit ? 'Editar Usuário' : 'Novo Usuário' }}
      </h2>
      <button
        mat-icon-button
        mat-dialog-close
        aria-label="Fechar"
        class="!w-8 !h-8 !flex !items-center !justify-center !bg-blue-600 hover:!bg-blue-500 !transition-colors !duration-300"
      >
        <mat-icon class="!text-white !scale-90 !leading-none !m-0 !p-0">close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="!px-6 !pb-1 !pt-1">
      <form autocomplete="off" class="flex flex-col gap-6">
        <div>
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b pb-1 mt-0">
            Dados do cadastro
          </h3>

          <div class="flex flex-col gap-y-3">
            <app-field-wrapper [field]="usuarioForm.name()">
              <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                <mat-label>Nome Completo</mat-label>
                <input matInput [formField]="usuarioForm.name" placeholder="Ex: João da Silva" />
              </mat-form-field>
            </app-field-wrapper>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-3">
              <app-field-wrapper [field]="usuarioForm.userName()">
                <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                  <mat-label>Login (User Name)</mat-label>
                  <input matInput [formField]="usuarioForm.userName" />
                </mat-form-field>
              </app-field-wrapper>

              <app-field-wrapper [field]="usuarioForm.email()">
                <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                  <mat-label>E-Mail</mat-label>
                  <input matInput [formField]="usuarioForm.email" />
                </mat-form-field>
              </app-field-wrapper>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-12 gap-x-3 items-center">

              <div class="sm:col-span-7 pb-5">
                <mat-form-field appearance="outline" class="w-full" floatLabel="always" subscriptSizing="dynamic">
                  <mat-label>Roles</mat-label>
                  <mat-select multiple="true" placeholder="Adicione permissões" [formField]="usuarioForm.permissions">
                    @for (role of roles(); track role) {
                      <mat-option [value]="role">{{ role }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="sm:col-span-5 flex flex-row gap-4 sm:justify-end whitespace-nowrap pb-5">
                <mat-checkbox [formField]="usuarioForm.activated">Ativo</mat-checkbox>
                <mat-checkbox [formField]="usuarioForm.forcePasswordChange!">Trocar Senha</mat-checkbox>
              </div>

            </div>
          </div>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions class="!px-6 !pb-4 !pt-4 flex flex-col sm:flex-row sm:justify-end items-center gap-3">
      <button
        mat-flat-button
        class="w-full sm:w-auto !bg-blue-600 !text-white !transition-transform duration-300 !ease-in-out hover:!scale-105 !h-12 sm:!h-10"
        (click)="salvar()"
        [disabled]="usuarioForm().invalid()"
      >
        <mat-icon class="mr-2">save</mat-icon>
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
  userFormModel = signal<TUsuarioUpdate>({
    name: '',
    userName: '',
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

    // E-mail
    required(path.email, { message: 'E-mail é obrigatório' });
    email(path.email, { message: 'E-mail inválido' });
  });

  ngOnInit() {
    this.loadRoles();

    this.isEdit = !!this.data;

    if (this.isEdit && this.data) {
      this.userFormModel.update((u: TUsuarioUpdate) => ({
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
        customHttpError(
          err, this.notificationService, `${this.isEdit ? 'Atualização' : 'Cadastro'}`
        );
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
