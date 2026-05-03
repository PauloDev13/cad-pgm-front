import { ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal, untracked } from '@angular/core';
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
import { customHttpError } from '../../../../shared/utils/custom-http-response-error';

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
    <div class="flex justify-between items-center px-6 pt-4 pb-1">
      <h2 mat-dialog-title class="!font-bold !text-xl !text-blue-700 !m-0 !p-0">
        @if (isReactivate) {
          Readmitir: <span class="text-gray-600 font-medium">{{ payload?.nome }}</span>
        } @else if (isEdit) {
          Editar Servidor
        } @else {
          Novo Servidor
        }
      </h2>
      <button
        mat-icon-button
        mat-dialog-close
        aria-label="Fechar"
        class="!w-8 !h-8 !flex !items-center !justify-center !bg-blue-600 hover:!bg-blue-500
              !transition-colors !duration-300"
      >
        <mat-icon class="!text-white !scale-90 !leading-none !m-0 !p-0">close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="!px-6 !pb-1 !pt-1">
      <form autocomplete="off" class="flex flex-col gap-6">

        <div>
          <h3
            class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b
                  pb-1 mt-0">
            Dados Pessoais
          </h3>

          <div class="flex flex-col gap-y-3">
            <app-field-wrapper [field]="servidorForm.nome()">
              <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                <mat-label>Nome Completo</mat-label>
                <input matInput [formField]="servidorForm.nome" placeholder="Ex: João da Silva" />
              </mat-form-field>
            </app-field-wrapper>

            <app-field-wrapper [field]="servidorForm.filiacao()">
              <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                <mat-label>Filiação (Nome da Mãe/Pai)</mat-label>
                <input matInput [formField]="servidorForm.filiacao" />
              </mat-form-field>
            </app-field-wrapper>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-3">
              <app-field-wrapper [field]="servidorForm.matricula()">
                <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                  <mat-label>Matrícula</mat-label>
                  @if (isTerceirizado) {
                    <input
                      matInput
                      [formField]="servidorForm.matricula"
                      placeholder="Ex: T032"
                    />

                  } @else {
                    <input
                      matInput
                      [formField]="servidorForm.matricula"
                      [mask]="'0.000-0||00.000-0||000.000-0||0000.000-0'"
                      [dropSpecialCharacters]="true"
                    />

                  }
                </mat-form-field>
              </app-field-wrapper>

              <app-field-wrapper [field]="servidorForm.cpf()">
                <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                  <mat-label>CPF</mat-label>
                  <input
                    matInput
                    [formField]="servidorForm.cpf"
                    placeholder="Somente números"
                    mask="000.000.000-00" />
                </mat-form-field>
              </app-field-wrapper>

              <app-field-wrapper [field]="servidorForm.dataNascimento()">
                <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                  <mat-label>Data de Nascimento</mat-label>
                  <input
                    matInput [matDatepicker]="pickerNascimento"
                    [formField]="servidorForm.dataNascimento"
                    placeholder="DD/MM/AAAA" />
                  <mat-datepicker-toggle
                    matIconSuffix [for]="pickerNascimento"></mat-datepicker-toggle>
                  <mat-datepicker #pickerNascimento></mat-datepicker>
                </mat-form-field>
              </app-field-wrapper>

              <app-custom-select
                label="Gênero"
                placeholder="Selecione..."
                [field]="servidorForm.genero()"
                [options]="generos()" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-x-3">
              <app-field-wrapper [field]="servidorForm.telefone()">
                <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                  <mat-label>Celular</mat-label>
                  <input mask="(00) 0 0000-0000" matInput [formField]="servidorForm.telefone" />
                </mat-form-field>
              </app-field-wrapper>

              <app-field-wrapper [field]="servidorForm.emailPessoal()">
                <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                  <mat-label>E-mail Pessoal</mat-label>
                  <input matInput [formField]="servidorForm.emailPessoal" type="email" />
                </mat-form-field>
              </app-field-wrapper>

              <app-field-wrapper [field]="servidorForm.emailInstitucional()">
                <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                  <mat-label>E-mail Institucional</mat-label>
                  <input matInput [formField]="servidorForm.emailInstitucional" type="email" />
                </mat-form-field>
              </app-field-wrapper>
            </div>

            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <mat-label>Endereço Completo</mat-label>
              <input
                matInput
                [formField]="servidorForm.endereco"
                placeholder="Rua, Número, Bairro, Cidade - UF" />
            </mat-form-field>
          </div>
        </div>

        <div>
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b
                    pb-1 mt-0">
            Vínculo Funcional
          </h3>

          <div class="flex flex-col gap-y-3">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-x-3">
              <app-list-autocomplete
                [data]="cargos()"
                label="Cargo"
                placeholder="Pesquisar..."
                [selectedId]="servidorModel().cargoId"
                (selectedIdChange)="onCargoChange($event)"
                [hasExternalError]="servidorForm.cargoId().invalid()"
                [errorMessage]="servidorForm.cargoId().invalid()
                  ? servidorForm.cargoId().errors()[0]?.message
                  : ''"
                [externalTouched]="servidorForm.cargoId().touched()" />

              <app-custom-select
                label="Setor"
                placeholder="Selecione..."
                [field]="servidorForm.setorId()"
                [options]="setores()" />

              <app-custom-select
                label="Lotação"
                placeholder="Selecione..."
                [field]="servidorForm.lotacaoId()"
                [options]="lotacaoList()" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-3">
              <app-custom-select
                label="Status"
                placeholder="Selecione..."
                [field]="servidorForm.statusId()"
                [options]="statusList()" />

              <app-custom-select
                label="Vínculo"
                placeholder="Selecione..."
                [field]="servidorForm.vinculoId()"
                [options]="vinculos()"
              />
            </div>
          </div>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions
      class="!px-6 !pb-4 !pt-4 flex flex-col sm:flex-row sm:justify-between items-center gap-3">
      <button
        mat-stroked-button
        type="button"
        class="w-full sm:w-auto !border-blue-600 !text-blue-600 !transition-transform duration-300
              hover:!scale-105 disabled:!border-gray-300 disabled:!text-gray-400 !h-12 sm:!h-10
              order-2 sm:order-1"
        [disabled]="servidorForm().invalid() || !isPermissionsButtonHidden()"
        (click)="openPermissions()"
      >
        <mat-icon class="mr-2">security</mat-icon>
        Gerenciar Permissões
      </button>

      <button
        mat-flat-button
        class="w-full sm:w-auto !transition-transform duration-300 hover:!scale-105 !h-12 sm:!h-10
              order-1 sm:order-2"
        (click)="salvar()"
        [disabled]="servidorForm().invalid()"
      >
        <mat-icon class="mr-2">{{ isReactivate ? 'settings_backup_restore' : 'save' }}</mat-icon>
        {{ isReactivate ? 'Confirmar Readmissão' : (isEdit ? 'Atualizar' : 'Salvar') }}
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

  constructor() {
    effect(() => {
      // Atribui valores as variáveis locais effect
      const selectedId = this.servidorForm.vinculoId().value();
      const vinculoList = this.vinculos();

      untracked(() => {
        if (!selectedId) return;
        // atribui valores as variáveis locais do untracked
        const selectedVinculo = vinculoList.find(opt => opt.id === selectedId);
        const vinculoName = (selectedVinculo?.nome || '').toLowerCase();
        const currentMatricula = this.servidorForm.matricula().value();

        // --- CENÁRIO: MUDOU PARA TERCEIRIZADO ---
        if (vinculoName !== 'comissionado' && vinculoName !== 'efetivo') {

          // Se a matrícula atual ainda não é "T", guardamos ela como original caso não tenha sido salva
          if (currentMatricula && !currentMatricula.startsWith('T') && !this.originMatricula) {
            this.originMatricula = currentMatricula;
            this.originVinculoId = this.servidorForm.vinculoId().value();
          }

          // Se já temos um "T" no cache, restauramos. Senão, geramos um novo.
          if (this.cacheMatriculaTerceirizado) {
            this.servidorForm.matricula().controlValue.set(this.cacheMatriculaTerceirizado);
            // this.servidorForm.matricula().value.set(this.cacheMatriculaTerceirizado);
          } else if (!currentMatricula?.startsWith('T')) {
            const newMatricula = this.gerarMatriculaTerceirizado();
            this.cacheMatriculaTerceirizado = newMatricula;
            this.servidorForm.matricula().value.set(newMatricula);
          }

          // --- CENÁRIO: MUDOU PARA QUALQUER OUTRO VÍNCULO ---
        } else {
          // 1. Se ele voltou para o vínculo que tinha no início (Ex: Efetivo)
          if (selectedId === this.originVinculoId) {
            this.servidorForm.matricula().controlValue.set(this.originMatricula || '');
            // this.servidorForm.matricula().value.set(this.originMatricula || '');
          }
          // 2. Se é um vínculo novo (nem o original, nem terceirizado), limpamos conforme sua regra
          else {
            this.servidorForm.matricula().controlValue.set('');
            // this.servidorForm.matricula().value.set('');
          }

          // Se a matrícula que estava antes era um "T", salvamos no cache para não perder
          if (currentMatricula && currentMatricula.startsWith('T')) {
            this.cacheMatriculaTerceirizado = currentMatricula;
          }
        }
      });
    });
  }

  // MÉTODOS PARA A READMISSÃO DE SERVIDOR
  // Recebemos um "any" para suportar o DTO direto (legado) ou o novo wrapper
  readonly dialogData = inject<any>(MAT_DIALOG_DATA, { optional: true });

  isReactivate = this.dialogData?.action === 'REACTIVATE';


  // Lógica de extração de dados e estado do formulário
  payload: ServidorResponseDTO | undefined = this.isReactivate
    ? this.dialogData?.payload
    : this.dialogData;

  // É edição se tem payload mas NÃO é readmissão
  isEdit = !!this.payload && !this.isReactivate;

  //  Atualizado para buscar do this.payload ao invés do this.data
  private originMatricula: string | undefined = this.payload?.matricula;
  private originVinculoId: number | undefined = this.payload?.vinculo?.id;
  private cacheMatriculaTerceirizado: string | null = null;

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
    validate(path.cpf, ({ value }) => CustomValidators.cpfValidator(value()));

    // validações para o campo Data de Nascimento
    required(path.dataNascimento, { message: 'A data é obrigatório' });
    validate(path.dataNascimento, ({ value }) =>
      CustomValidators.minimunAge(value(), 16));

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
    this.loadDomains();

    if (this.payload) {
      try {
        this.servidorModel.update((m) => ({
          ...m,
          ...this.payload,
          // CONVERSÃO DA DATA
          // Se existir a data no DTO, criamos o objeto Date. O 'T00:00:00' evita
          // bugs de fuso horário que poderiam fazer o dia voltar 1 número.
          // Usamos 'as any' temporariamente para o TypeScript não reclamar do tipo inicial 'string'.
          dataNascimento: this.payload?.dataNascimento
            ? (new Date(this.payload.dataNascimento + 'T00:00:00') as any)
            : '',

          // BLINDAGEM 3: O "|| null" impede que o modelo receba undefined e apague o controle
          cargoId: this.payload?.cargo?.id || null as unknown as number,
          setorId: this.payload?.setor?.id || null as unknown as number,
          lotacaoId: this.payload?.lotacao?.id || null as unknown as number,
          statusId: this.payload?.status?.id || null as unknown as number,
          vinculoId: this.payload?.vinculo?.id || null as unknown as number,

          // RELACIONAMENTOS MÚLTIPLOS (N para N) <---
          // O backend manda um array de objetos [{id: 1, nome: 'X'}].
          // O map() extrai só os IDs para o DTO de envio: [1]. Se for nulo, devolve [] vazio.
          sistemaIds: this.payload?.sistemas?.map((s) => s.id) || [],
          procuradorIds: this.payload?.procuradores?.map((p) => p.id) || [],
          aliasIds: this.payload?.aliases?.map((a) => a.id) || []
        }));
      } catch (err) {
        console.log('Dados problemáticos recebidos:', this.payload);
      }
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
        if (this.isReactivate) {
          await firstValueFrom(this.servidorService.reactivate(this.payload!.id, requestData));
        } else if (this.isEdit) {
          await firstValueFrom(this.servidorService.update(this.payload!.id, requestData));
        } else {
          await firstValueFrom(this.servidorService.create(requestData));
        }

        const msgAction = this.isReactivate ? 'readmitido' : (this.isEdit ? 'atualizado' : 'cadastrado');
        const msgTitle = this.isReactivate ? 'Readmissão' : (this.isEdit ? 'Atualização' : 'Cadastro');

        this.notificationService.success(
          `Servidor ${msgAction} com sucesso!`,
          `${msgTitle}`
        );

        this.dialogRef.close(true);
      } catch (err: any) {
        const msgTitle = this.isReactivate ? 'Readmissão' : (this.isEdit ? 'Atualização' : 'Cadastro');
        console.error('Erro inesperado', err.message);
        customHttpError(
          err, this.notificationService, msgTitle
        );
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

  // MÉTHOD AUXILIAR: Gera um código no formato "T" + 3 ou 4 dígitos aleatórios
  private gerarMatriculaTerceirizado(): string {
    // Gera um número entre 10000 e 99999
    const randomNumber = Math.floor(100 + Math.random() * 900);
    return `T${randomNumber}`;
  }

  get isTerceirizado(): boolean {
    const idSelecionado = this.servidorForm.vinculoId().value();
    const vinculo = this.vinculos()
      .find(v => v.id === idSelecionado);

    const name = vinculo?.nome.toLowerCase();

    return (
      name !== 'comissionado' && name !== 'efetivo'
    );
  }
}
