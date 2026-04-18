import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ServidorService } from '../../services/servidor.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BaseEntityDTO, ServidorRequestDTO, ServidorResponseDTO } from '../../models/servidor.model';
import {
  email,
  form,
  FormField,
  maxLength,
  minLength,
  pattern,
  required,
  submit,
  validate
} from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { DominioService } from '../../services/dominio.service';
import { AutocompleteComponent } from '../../../../shared/components/autocomplete/autocomplete.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CustomSelectComponent } from '../../../../shared/components/custom-select/custom-select.component';
import {
  PermissoesDialogComponent,
  PermissoesDialogData
} from '../../../../shared/components/permissoes-dialog/permissoes-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { CustomValidators } from '../../../../shared/utils/custom-validators';
import { NgxMaskDirective } from 'ngx-mask';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { FieldWrapperComponent } from '../../../../shared/layout/component/field-wrapper.component';
import { NotificationService } from '../../../../shared/service/NotificationSnackbar.service';

export type FormModel = Required<ServidorRequestDTO>;

@Component({
  selector: 'app-cad-form.component',
  imports: [
    FormField,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    AutocompleteComponent,
    CustomSelectComponent,
    NgxMaskDirective,
    FieldWrapperComponent
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title class="!font-bold !text-xl !pb-0 !text-blue-700">
      {{ isEdit ? 'Editar Servidor' : 'Novo Servidor' }}
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
    <mat-dialog-content class="!pt-4">
      <form autocomplete="off" class="flex flex-col gap-2">
        <div>
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Dados Pessoais
          </h3>
          <app-field-wrapper [field]="servidorForm.nome()">
            <!--Campo nome-->
            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <mat-label>Nome Completo</mat-label>
              <input matInput [formField]="servidorForm.nome" placeholder="Ex: João da Silva" />
            </mat-form-field>
          </app-field-wrapper>
          <!--Campo filiação-->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Filiação (Nome da Mãe/Pai)</mat-label>
            <input matInput [formField]="servidorForm.filiacao" />
          </mat-form-field>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
            <app-field-wrapper [field]="servidorForm.matricula()">
              <!--Campo Matrícula-->
              <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                <mat-label>Matrícula</mat-label>
                <input matInput [formField]="servidorForm.matricula" />
              </mat-form-field>
            </app-field-wrapper>

            <app-field-wrapper [field]="servidorForm.cpf()">
              <!--Campo CPF-->
              <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                <mat-label>CPF</mat-label>
                <input
                  matInput
                  [formField]="servidorForm.cpf"
                  placeholder="Somente números"
                  mask="000.000.000-00"
                />
              </mat-form-field>
            </app-field-wrapper>

            <app-field-wrapper [field]="servidorForm.dataNascimento()">
              <!--Campo Data Nascimento-->
              <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                <mat-label>Data de Nascimento</mat-label>
                <input
                  matInput
                  [matDatepicker]="pickerNascimento"
                  [formField]="servidorForm.dataNascimento"
                  placeholder="Data'DD/MM/AAAA'"
                />
                <mat-datepicker-toggle class="!mr-2" matIconSuffix [for]="pickerNascimento" />
                <mat-datepicker #pickerNascimento></mat-datepicker>
              </mat-form-field>
            </app-field-wrapper>

            <!--Campo Gênero-->
            <app-custom-select
              label="Gênero"
              placeholder="Selecione o Gênero"
              [field]="servidorForm.genero()"
              [options]="generos()"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <app-field-wrapper [field]="servidorForm.telefone()">
              <!--Campo telefone-->
              <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                <mat-label>Celular</mat-label>
                <input mask="(00) 0 0000-0000" matInput [formField]="servidorForm.telefone" />
              </mat-form-field>
            </app-field-wrapper>

            <app-field-wrapper [field]="servidorForm.emailPessoal()">
              <!--Campo email pessoal-->
              <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                <mat-label>E-mail Pessoal</mat-label>
                <input matInput [formField]="servidorForm.emailPessoal" type="email" />
              </mat-form-field>
            </app-field-wrapper>

            <app-field-wrapper [field]="servidorForm.emailInstitucional()">
              <!--Campo email institucional-->
              <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                <mat-label>E-mail Institucional</mat-label>
                <input matInput [formField]="servidorForm.emailInstitucional" type="email" />
              </mat-form-field>
            </app-field-wrapper>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-1 mb-6">
            <!--Campo Endereço-->
            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <mat-label>Endereço Completo</mat-label>
              <input
                matInput
                [formField]="servidorForm.endereco"
                placeholder="Rua, Número, Bairro, Cidade - UF"
              />
            </mat-form-field>
          </div>
        </div>
        <div>
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Vínculo Funcional
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-1">
            <!--Campo Cargo-->
            <app-list-autocomplete
              [data]="cargos()"
              label="Cargo"
              placeholder="Digite para pesquisar o Cargo..."
              [selectedId]="servidorModel().cargoId"
              (selectedIdChange)="onCargoChange($event)"
              [hasExternalError]="servidorForm.cargoId().invalid()"
              [errorMessage]="
                servidorForm.cargoId().invalid() ? servidorForm.cargoId().errors()[0]?.message : ''
              "
              [externalTouched]="servidorForm.cargoId().touched()"
            />

            <!--Campo Setor-->
            <app-custom-select
              label="Setor"
              placeholder="Clique e selecione o Setor"
              [field]="servidorForm.setorId()"
              [options]="setores()"
            />

            <!--Campo Lotação-->
            <app-custom-select
              label="Lotação"
              placeholder="Clique e selecione a Lotação "
              [field]="servidorForm.lotacaoId()"
              [options]="lotacaoList()"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <!--Campo Status-->
            <app-custom-select
              label="Status"
              placeholder="Clique e selecione o Status"
              [field]="servidorForm.statusId()"
              [options]="statusList()"
            />

            <!--Campo Vínculo-->
            <app-custom-select
              label="Vínculo"
              placeholder="Clique e selecione o Vínculo"
              [field]="servidorForm.vinculoId()"
              [options]="vinculos()"
            />
          </div>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="!pb-6 !pr-6">
      <button
        mat-stroked-button
        type="button"
        class="mr-auto !border-blue-600 !text-blue-600 !transition-transform
                 duration-300 !ease-in-out hover:!scale-105 disabled:!bg-gray-200
                 disabled:!cursor-not-allowed disabled:!pointer-events-auto disabled:hover:!scale-100
                 disabled:!text-gray-400 disabled:!border-gray-400"
        [disabled]="servidorForm().invalid() || !isPermissionsButtonHidden()"
        (click)="openPermissions()"
      >
        <mat-icon>security</mat-icon>
        Gerenciar Permissões
      </button>
      <button
        mat-flat-button
        class="!transition-transform duration-300 !ease-in-out hover:!scale-105"
        (click)="salvar()"
        [disabled]="servidorForm().invalid()"
      >
        <mat-icon class="!mr-0.5">save</mat-icon>
        {{ isEdit ? 'Atualizar' : 'Salvar' }}
      </button>
    </mat-dialog-actions>
  `
})
export class ServidorFormComponent implements OnInit {
  // Injeções de dependência
  private readonly servidorService = inject(ServidorService);
  private readonly dominioService = inject(DominioService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialogRef = inject(MatDialogRef<ServidorFormComponent>);
  private readonly dialog = inject(MatDialog);
  private readonly authService = inject(AuthService);

  // Variáveis diversas
  isEdit: boolean = false;
  readonly data = inject<ServidorResponseDTO>(MAT_DIALOG_DATA, { optional: true });
  // Signals para armazenar os dados que virão da API
  cargos = signal<BaseEntityDTO[]>([]);
  setores = signal<BaseEntityDTO[]>([]);
  vinculos = signal<BaseEntityDTO[]>([]);
  statusList = signal<BaseEntityDTO[]>([]);
  // Signals para armazenar dados estáticos vindos do domínio service
  generos = signal<BaseEntityDTO[]>([]);
  lotacaoList = signal<BaseEntityDTO[]>([]);
  // Modelo para validação
  servidorModel = signal<FormModel>({
    nome: '',
    matricula: '',
    cpf: '',
    dataNascimento: '',
    genero: '',
    telefone: '',
    emailPessoal: '',
    emailInstitucional: '',
    endereco: '',
    filiacao: '',
    // Garantindo tipos compatíveis com numbers que iniciam vazios
    cargoId: null as unknown as number,
    setorId: null as unknown as number,
    lotacaoId: 1,
    statusId: 1,
    vinculoId: null as unknown as number,

    procuradorIds: [],
    aliasIds: [],
    sistemaIds: []
  });
  // validações dos campos do formulário
  servidorForm = form(this.servidorModel, (path) => {
    // validações para o campo Nome
    required(path.nome, { message: 'O nome é obrigatório' });
    minLength(path.nome, 5, { message: 'O Nome deve ter no mínimo 5 caracteres' });
    maxLength(path.nome, 150, {
      message: 'O nome deve ter no máximo 150 caracteres'
    });

    // validações para o campo Matrícula
    required(path.matricula, { message: 'A matrícula é obrigatório' });
    maxLength(path.matricula, 20, {
      message: 'A matrícula deve ter no máximo 20 caracteres'
    });

    // validações para o campo CPF
    required(path.cpf, { message: 'O CPF é obrigatório' });
    pattern(path.cpf, /^\d{11}$/, { message: 'O CPF deve ter 11 dígitos' });

    // validações para o campo Data de Nascimento
    required(path.dataNascimento, { message: 'A data é obrigatório' });
    validate(path.dataNascimento, ({ value }) => CustomValidators.minimunAge(value(), 16));
    // validate(path.dataNascimento, ({ value }) => CustomValidators.dataValida(value()));

    // validações para o campo Telefone
    maxLength(path.telefone, 20, {
      message: 'O telefone deve ter no máximo 20 dígitos'
    });

    // validações para o campo Email Pessoal
    required(path.emailPessoal, { message: 'O Email é obrigatório' });
    email(path.emailPessoal, { message: 'E-mail inválido' });
    maxLength(path.emailPessoal, 100, {
      message: 'O Email deve ter no máximo 100 caracteres'
    });

    // validações para o campo Email Institucional
    maxLength(path.emailInstitucional, 100, {
      message: 'O Email deve ter no máximo 100 caracteres'
    });
    email(path.emailInstitucional, { message: 'E-mail inválido' });

    // validações para os campos de relacionamentos
    required(path.cargoId, { message: 'O Cargo é obrigatório' });
    required(path.setorId, { message: 'O Setor é obrigatório' });
    required(path.lotacaoId, { message: 'A Lotação é obrigatório' });
    required(path.statusId, { message: 'O Status é obrigatório' });
    required(path.vinculoId, { message: 'O vinculo é obrigatório' });
  });

  // Computed
  isPermissionsButtonHidden = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return;
    return user.roles.some((p) => p === 'admin');
  });

  // controla as mudanças no campo autocomplete Cargo
  onCargoChange(id: number | null) {
    this.servidorModel.update((m) => ({
      ...m,
      cargoId: id as number
    }));
  }

  ngOnInit() {
    this.isEdit = !!this.data;

    this.loadDomains();

    if (this.isEdit && this.data) {
      this.servidorModel.update((m) => ({
        ...m,
        ...this.data,
        // CONVERSÃO DA DATA
        // Se existir a data no DTO, criamos o objeto Date. O 'T00:00:00' evita
        // bugs de fuso horário que poderiam fazer o dia voltar 1 número.
        // Usamos 'as any' temporariamente para o TypeScript não reclamar do tipo inicial 'string'.
        dataNascimento: this.data?.dataNascimento
          ? (new Date(this.data.dataNascimento + 'T00:00:00') as any)
          : '',
        cargoId: this.data?.cargo?.id as number,
        setorId: this.data?.setor?.id as number,
        lotacaoId: this.data?.lotacao?.id as number,
        statusId: this.data?.status?.id as number,
        vinculoId: this.data?.vinculo?.id as number,

        // NOVO: RELACIONAMENTOS MÚLTIPLOS (N para N) <---
        // O backend manda um array de objetos [{id: 1, nome: 'X'}].
        // O map() extrai só os IDs para o DTO de envio: [1]. Se for nulo, devolve [] vazio.
        sistemaIds: this.data?.sistemas?.map((s) => s.id) || [],
        procuradorIds: this.data?.procuradores?.map((p) => p.id) || [],
        aliasIds: this.data?.aliases?.map((a) => a.id) || []
      }));
    }
  }

  // Salva ou Atualiza um registro com todos os dados de um funcionário
  async salvar() {
    // e checa o valid() automaticamente antes de engatilhar o callback.
    await submit(this.servidorForm, async () => {
      try {
        // Obtemos os valores diretos do Signal de Modelo Atualizado
        const requestData = this.servidorModel() as ServidorRequestDTO;

        // Transformamos as chamadas Observable em Promise com firstValueFrom
        if (this.isEdit) {
          await firstValueFrom(this.servidorService.update(this.data!.id, requestData));
        } else {
          await firstValueFrom(this.servidorService.create(requestData));
        }

        this.notificationService.success(
          `Servidor ${this.isEdit ? 'atualizado' : 'cadastrado'} com sucesso!`,
          `${this.isEdit ? 'Atualização' : 'Cadastro'}`
        );

        this.dialogRef.close(true);
      } catch (err: any) {
        console.error('Erro inesperado', err.message);
      }
    });
  }

  openPermissions() {
    const dialogRef = this.dialog.open(PermissoesDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {
        sistemaIds: this.servidorModel().sistemaIds || [],
        procuradorIds: this.servidorModel().procuradorIds || [],
        aliasIds: this.servidorModel().aliasIds || []
      }
    });
    dialogRef.afterClosed().subscribe((result: PermissoesDialogData | undefined) => {
      if (result) {
        // Se o usuário confirmou, nós mesclamos os arrays no modelo principal
        this.servidorModel.update((model) => ({
          ...model,
          sistemaIds: result.sistemaIds,
          procuradorIds: result.procuradorIds,
          aliasIds: result.aliasIds
        }));
      }
    });
  }

  // Busca os dados na API e seta os signals
  loadDomains() {
    this.dominioService.getCargos().subscribe((res) => this.cargos.set(res));
    this.dominioService.getSetores().subscribe((res) => this.setores.set(res));
    this.dominioService.getStatus().subscribe((res) => this.statusList.set(res));
    this.dominioService.getVinculos().subscribe((res) => this.vinculos.set(res));

    // Busca dados estáticos e simula uma requisição a API
    this.dominioService.getLotacaoList().subscribe((res) => this.lotacaoList.set(res));
    this.dominioService.getGeneros().subscribe((res) => this.generos.set(res));
  }
}
