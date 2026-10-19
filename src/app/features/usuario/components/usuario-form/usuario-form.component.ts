import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { form, FormField, submit } from '@angular/forms/signals';
import { IUsuarioRequest, IUsuarioResponse } from '../../models/usuario.model';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FieldWrapperComponent } from '../../../../shared/layout/component/field-wrapper/field-wrapper.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { initialDataUsuario, subscriptionSchema } from '../../utils/subscription-usuario';
import { UsersStore } from '../../store/user.store';
import { AutocompleteComponent } from '../../../../shared/components/autocomplete/autocomplete.component';
import { UsuarioService } from '../../services/usuario.service';
import { NotificationService } from '../../../../shared/service/NotificationSnackbar.service';

@Component({
  selector: 'app-usuario-form.component',
  imports: [
    MatFormFieldModule,
    MatIconModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    FieldWrapperComponent,
    MatCheckboxModule,
    FormField,
    AutocompleteComponent
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

        @if (!isEdit) {
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider border-b pb-1 mt-0">
            Vínculo Institucional
          </h3>
          <div>
            <app-list-autocomplete
              [data]="servidoresDisponiveis()"
              label="Selecione o Servidor"
              placeholder="Pesquisar por nome ou matrícula..."
              [selectedId]="usuarioFormModel().servidorId ?? null"
              (selectedIdChange)="onServidorSelecionado($event)"
            />
            @if (erroServidorNaoSelecionado()) {
              <span class="text-xs text-red-600 font-medium">É obrigatório selecionar um Servidor.</span>
            }
          </div>
        }
        <div>
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b pb-1 mt-0">
            Dados Para Login
          </h3>

          <div class="flex flex-col gap-y-3">
            @if (isEdit) {
              <app-field-wrapper [field]="usuarioForm.name()">
                <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                  <mat-label>Nome Completo (Origem: cadastro de Servidor</mat-label>
                  <input
                    disabled
                    matInput
                    [value]="selectedServidorNome()"
                    readonly
                    class="!text-gray-700 !cursor-not-allowed"
                  />
                </mat-form-field>
              </app-field-wrapper>
            }

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-3">
              <app-field-wrapper [field]="usuarioForm.userName()">
                <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                  <mat-label>Login (User Name)</mat-label>
                  <input matInput [formField]="usuarioForm.userName" />
                </mat-form-field>
              </app-field-wrapper>

              <mat-form-field appearance="outline" class="w-full" floatLabel="always">
                <mat-label>Grupos</mat-label>
                <mat-select
                  multiple="true"
                  placeholder="Adicione permissões" [formField]="$any(usuarioForm.permissions)">
                  @for (role of usersStore.roles(); track role) {
                    <mat-option [value]="role">{{ role }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-12 gap-x-3 items-center">
              <div class="sm:col-span-7 pb-5">
                @if (isEdit) {
                  <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                    <mat-label>E-Mail (Origem: cadastro de Servidor</mat-label>
                    <input
                      disabled
                      matInput
                      [value]="selectedServidorEmail()"
                      readonly
                      class="!text-gray-700 !cursor-not-allowed"
                    />
                  </mat-form-field>
                }
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
        class="w-full !rounded-3xl sm:w-auto !transition-transform duration-300 hover:!scale-105 !h-12 sm:!h-10"
        (click)="save()"
        [disabled]="usuarioForm().invalid()"
      >
        <mat-icon class="!mr-1">save</mat-icon>
        {{ isEdit ? 'Atualizar' : 'Salvar' }}
      </button>
    </mat-dialog-actions>
  `
})
export class UsuarioFormComponent implements OnInit {
  // Injeções de dependência
  protected readonly usersStore = inject(UsersStore);
  private readonly usuarioService = inject(UsuarioService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialogRef = inject(MatDialogRef<UsuarioFormComponent>);
  protected readonly data =
    inject<IUsuarioResponse>(MAT_DIALOG_DATA, { optional: true });

  // isEdit: boolean = false;
  readonly isEdit: boolean = !!this.data?.id;
  readonly servidoresDisponiveis = signal<{ id: number; nome: string }[]>([]);
  readonly erroServidorNaoSelecionado = signal(false);

  // Modelo do formulário para cadastro
  readonly usuarioFormModel = signal<IUsuarioRequest>({ ...initialDataUsuario });

  readonly usuarioForm = form(this.usuarioFormModel, subscriptionSchema);

  ngOnInit() {
    if (this.isEdit && this.data) {
      this.usuarioFormModel.set({
        servidorId: this.data.servidorId ?? null,
        name: this.data.name,
        userName: this.data.userName,
        email: this.data.email,
        activated: this.data.activated,
        permissions: this.data.permissions,
        forcePasswordChange: this.data.forcePasswordChange,
        password: ''

      });
      // Feedback preventivo na abertura para informar por que o checkbox 'Ativo' está travado
      if (this.data.servidorExcluded) {
        this.notificationService.warning(
          'Servidor com status "Excluído". O perfil encontra-se inativo e não ' +
          'pode ser reativado.',
          'Servidor Desligado',
          {
            duration: 5000
          }
        );
      }
    } else {
      this.usuarioService.getServidoresDisponiveis().subscribe({
        next: (servidores) => {
          this.servidoresDisponiveis.set(servidores);
        }
      });
    }
  }

  readonly selectedServidorNome = computed(() => {
    if (this.isEdit) return this.data?.name || '';

    const id = this.usuarioFormModel().servidorId;

    const serv = this.servidoresDisponiveis().find(s => s.id === id);

    return serv ? serv.nome : 'Selecione um servidor acima';
  });

  readonly selectedServidorEmail = computed(() => {
    if (this.isEdit) return this.data?.email || '';
    return 'Herdado do cadastro do Servidor';
  });

  onServidorSelecionado(id: number | null) {
    this.usuarioFormModel.update(m => ({ ...m, servidorId: id }));
    this.erroServidorNaoSelecionado.set(false);
  }

  // Salva o usuário
  async save() {
    if (!this.isEdit && !this.usuarioFormModel().servidorId) {
      this.erroServidorNaoSelecionado.set(true);
      return;
    }

    await submit(this.usuarioForm, async () => {
      this.usersStore.saveUser({
        isEdit: this.isEdit,
        userId: this.data?.id,
        rawPayload: this.usuarioFormModel(),
        onSuccess: () => this.dialogRef.close(true)
      });
    });
  }
}
