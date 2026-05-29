import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  OnInit,
  signal,
  untracked
} from '@angular/core';
import { ServidorService } from '../../services/servidor.service';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ServidorRequestDTO, ServidorResponseDTO } from '../../models/servidor.model';
import { form, FormField } from '@angular/forms/signals';
import { finalize, switchMap } from 'rxjs';
import { AutocompleteComponent } from '../../../../shared/components/autocomplete/autocomplete.component';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CustomSelectComponent } from '../../../../shared/components/custom-select/custom-select.component';
import { MatIconModule } from '@angular/material/icon';
import { NgxMaskDirective } from 'ngx-mask';
import { FieldWrapperComponent } from '../../../../shared/layout/component/field-wrapper/field-wrapper.component';
import { NotificationService } from '../../../../shared/service/NotificationSnackbar.service';
import { ErrorHandlerService } from '../../../../shared/service/error-handler.service';
import { DateTime } from 'luxon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { initialDataServidor, subscriptionSchema } from '../../utils/subscription-servidor';
import { ServidoresStore } from '../../store/servidor.store';
import { MatTabsModule } from '@angular/material/tabs';
import { DocumentManagerComponent } from '../document-manager-dialog/document-manager.component';
import { VinculosPermissoesComponent } from '../vinculos-permissoes/vinculos-permissoes.component';
import { AuthStore } from '../../../../core/auth/store/auth.store';

export type FormModel = Required<ServidorRequestDTO>;

@Component({
  selector: 'app-cad-form.component',
  imports: [
    FormField,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    AutocompleteComponent,
    CustomSelectComponent,
    NgxMaskDirective,
    FieldWrapperComponent,
    MatTabsModule,
    DocumentManagerComponent,
    VinculosPermissoesComponent
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-tab-group
      animationDuration="0ms"
      class="sm:h-[760px] w-full p-2 custom-folder-tabs">
      >
      <mat-tab label="Dados Pessoais e Funcionais">

        <div class="flex justify-between items-center px-6 pt-2 pb-1">
          <h2 mat-dialog-title class="!font-bold !text-xl !text-blue-700 !m-0 !p-0">
            @if (isReactivate) {
              Readmitir: <span class="text-gray-600 font-medium">{{ payload?.nome }}</span>
            } @else if (isEdit) {
              Editar Servidor
            } @else {
              Novo Servidor
            }
          </h2>
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
                <div class="flex flex-col sm:flex-row gap-3">
                  <!-- input de seleção da foto-->
                  <input
                    type="file"
                    #fileInput
                    class="hidden"
                    accept=".jpg,.jpeg,.png"
                    (change)="onSelectedPhoto($event)">

                  <div class="shrink-0 flex items-start justify-center sm:justify-start">
                    <div
                      class="w-[2.5cm] h-[3.5cm] rounded-xl border border-gray-300 overflow-hidden
                        relative shadow-sm bg-white group cursor-pointer transition-all
                         duration-300 hover:shadow-md hover:border-blue-400 active:scale-95"
                      (click)="fileInput.click()"
                      matTooltip="Clique para alterar a foto"
                    >
                      <img
                        [src]="photoUrl()"
                        alt="Foto do Servidor"
                        class="object-cover w-full h-full"
                      />
                      <div
                        class="hidden sm:flex absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100
                          transition-opacity duration-300 items-center justify-center">
                        <mat-icon class="!text-white scale-150">photo_camera</mat-icon>
                      </div>

                      <div
                        class="sm:hidden absolute bottom-0 inset-x-0 bg-black/50 py-0.5 flex
                           justify-center items-center">
                        <mat-icon class="!text-white scale-75 !m-0 !p-0">photo_camera</mat-icon>
                      </div>

                      @if (isUploadingPhoto()) {
                        <div class="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                          <mat-spinner diameter="30"></mat-spinner>
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Nome-->
                  <div class="flex-1 flex flex-col gap-y-3 justify-center">
                    <app-field-wrapper [field]="servidorForm.nome()">
                      <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                        <mat-label>Nome Completo</mat-label>
                        <input matInput [formField]="servidorForm.nome" placeholder="Ex: João da Silva" />
                      </mat-form-field>
                    </app-field-wrapper>

                    <!-- Filiação-->
                    <app-field-wrapper [field]="servidorForm.filiacao()">
                      <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                        <mat-label>Filiação (Nome da Mãe/Pai)</mat-label>
                        <input matInput [formField]="servidorForm.filiacao" />
                      </mat-form-field>
                    </app-field-wrapper>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-3">
                  <!-- CPF-->
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

                  <!-- Data Nascimento-->
                  <app-field-wrapper [field]="servidorForm.dataNascimento()">
                    <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                      <mat-label>Data de Nascimento</mat-label>
                      <input
                        matInput
                        class="text-right"
                        [formField]="servidorForm.dataNascimento"
                        mask="00/00/0000"
                        [dropSpecialCharacters]="false"
                        placeHolder="Data como 'DD/MM/YYYY'" />
                    </mat-form-field>
                  </app-field-wrapper>

                  <!-- gênero-->
                  <app-custom-select
                    label="Gênero"
                    placeholder="Selecione..."
                    [field]="servidorForm.genero()"
                    [options]="servidoresStore.generos()" />

                  <!-- Celular-->
                  <app-field-wrapper [field]="servidorForm.telefone()">
                    <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                      <mat-label>Celular</mat-label>
                      <input mask="(00) 0 0000-0000" matInput [formField]="servidorForm.telefone" />
                    </mat-form-field>
                  </app-field-wrapper>
                </div>


                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-3">
                  <!-- E-mail pessoal-->
                  <app-field-wrapper [field]="servidorForm.emailPessoal()">
                    <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                      <mat-label>E-mail Pessoal</mat-label>
                      <input matInput [formField]="servidorForm.emailPessoal" type="email" />
                    </mat-form-field>
                  </app-field-wrapper>

                  <!-- E-mail institucional-->
                  <app-field-wrapper [field]="servidorForm.emailInstitucional()">
                    <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                      <mat-label>E-mail Institucional</mat-label>
                      <input matInput [formField]="servidorForm.emailInstitucional" type="email" />
                    </mat-form-field>
                  </app-field-wrapper>
                </div>

                <!-- Endereço-->
                <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                  <mat-label>Endereço Completo</mat-label>
                  <input
                    matInput
                    [formField]="servidorForm.endereco"
                    placeholder="Rua, Número, Bairro, Cidade, UF, CEP" />
                </mat-form-field>
              </div>
            </div>

            <div>
              <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b
                    pb-1 mt-0">
                Vínculo Funcional
              </h3>

              <div class="grid grid-cols-1 md:grid-cols-12 gap-x-3 mb-2">
                <!-- Vínculo-->
                <app-list-autocomplete
                  class="md:col-span-4"
                  [data]="servidoresStore.vinculos()"
                  label="Vínculo"
                  placeholder="Pesquisar..."
                  [selectedId]="servidorModel().vinculoId"
                  (selectedIdChange)="onAutocompleteChange('vinculoId', $event)"
                  [hasExternalError]="servidorForm.vinculoId().invalid()"
                  [errorMessage]="servidorForm.vinculoId().invalid()
                  ? servidorForm.vinculoId().errors()[0]?.message
                  : ''"
                  [externalTouched]="servidorForm.vinculoId().touched()" />

                <!-- Matrícula-->
                <app-field-wrapper
                  class="md:col-span-2"
                  [field]="servidorForm.matricula()">
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

                <!-- Setor-->
                <app-list-autocomplete
                  class="md:col-span-6"
                  [data]="servidoresStore.setores()"
                  label="Setor"
                  placeholder="Pesquisar..."
                  [selectedId]="servidorModel().setorId"
                  (selectedIdChange)="onAutocompleteChange('setorId', $event)"
                  [hasExternalError]="servidorForm.setorId().invalid()"
                  [errorMessage]="servidorForm.setorId().invalid()
                  ? servidorForm.setorId().errors()[0]?.message
                  : ''"
                  [externalTouched]="servidorForm.setorId().touched()" />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-12 gap-x-3 mb-2">
                <!-- Cargo-->
                <app-list-autocomplete
                  class="md:col-span-5"
                  [data]="servidoresStore.cargos()"
                  label="Cargo"
                  placeholder="Pesquisar..."
                  [selectedId]="servidorModel().cargoId"
                  (selectedIdChange)="onAutocompleteChange('cargoId', $event)"
                  [hasExternalError]="servidorForm.cargoId().invalid()"
                  [errorMessage]="servidorForm.cargoId().invalid()
                  ? servidorForm.cargoId().errors()[0]?.message
                  : ''"
                  [externalTouched]="servidorForm.cargoId().touched()" />

                <!-- Lotação-->
                <app-custom-select
                  class="md:col-span-2"
                  label="Lotação"
                  placeholder="Selecione..."
                  [field]="servidorForm.lotacaoId()"
                  [options]="servidoresStore.lotacoes()" />

                <!-- Se for ADMIN, ver o select e pode editar-->
                @if (isAdminLogged()) {
                  <!-- Atividade-->
                  <app-custom-select
                    class="md:col-span-2"
                    label="Atividade"
                    placeholder="Selecione..."
                    [field]="servidorForm.tipoAtividade()"
                    [options]="servidoresStore.atividades()" />

                } @else {
                  <!-- Se não, aparece o input com a informação e bloqueado para edição-->
                  <mat-form-field appearance="outline" class="md:col-span-2 w-full">
                    <mat-label>Atividade</mat-label>
                    <input
                      matInput
                      class="w-full bg-transparent border-none text-gray-800 font-medium
                          focus:outline-none focus:ring-0 cursor-default"
                      type="text"
                      readonly
                      [value]="servidorForm.tipoAtividade().value()"
                    />
                  </mat-form-field>
                }

                <!-- Status-->
                <app-custom-select
                  class="md:col-span-3"
                  label="Status"
                  placeholder="Selecione..."
                  [field]="servidorForm.statusId()"
                  [options]="servidoresStore.status()" />

              </div>
            </div>
          </form>
        </mat-dialog-content>

        <mat-dialog-actions
          class="!px-6 !pb-4 !pt-0 flex flex-col sm:flex-row sm:justify-between items-center gap-3">
          <button
            class="w-full sm:w-auto !border-blue-600 !text-blue-600 !transition-transform duration-300
              hover:!scale-105 disabled:!border-gray-300 disabled:!text-gray-400 !h-12 sm:!h-10
              order-3 sm:order-1"
            mat-stroked-button
            (click)="closeModal()"
          >
            <mat-icon>exit_to_app</mat-icon>
            Sair
          </button>

          <button
            mat-flat-button
            class="w-full sm:w-auto !transition-transform duration-300 hover:!scale-105 !h-12 sm:!h-10
              order-1 sm:order-3"
            (click)="salvar()"
            [disabled]="servidorForm().invalid()"
          >
            <mat-icon class="mr-2">{{ isReactivate ? 'settings_backup_restore' : 'save' }}</mat-icon>
            {{ isReactivate ? 'Confirmar Readmissão' : (isEdit ? 'Atualizar' : 'Salvar') }}
          </button>
        </mat-dialog-actions>
      </mat-tab>

      <mat-tab label="Vínculos e Permissões" [disabled]="!currentServidorId()">
        <ng-template matTabContent>
          <div class="w-full h-[650px] md:h-[680px] p-2">
            @if (currentServidorId()) {
              <app-vinculos-permissoes
                class="block w-full h-full"
                [initialSistemas]="servidorModel().sistemaIds || []"
                [initialProcuradores]="servidorModel().procuradorIds || []"
                [initialAliases]="servidorModel().aliasIds || []"
                (permissionsChanged)="atualizarPermissoesNoModeloPai($event)"
              />
            } @else {
              <div class="flex flex-col items-center justify-center p-8 text-gray-500">
                <mat-icon class="text-4xl mb-2">lock</mat-icon>
                <p>Salve os dados do servidor para desbloquear o gerenciamento de permissões.</p>
              </div>
            }

          </div>
        </ng-template>
      </mat-tab>

      <mat-tab label="Documentos" [disabled]="!currentServidorId()">
        <ng-template matTabContent>
          <div class="w-full h-[650px] md:h-[680px] block bg-gray-50 rounded-xl overflow-hidden">
            @if (currentServidorId()!) {
              <app-document-manager
                class="block w-full h-full"
                [servidorId]="currentServidorId()!"
              />
            } @else {
              <div class="flex flex-col items-center justify-center p-8 text-gray-500">
                <mat-icon class="text-4xl mb-2">lock</mat-icon>
                <p>Salve os dados do servidor para desbloquear a anexação de documentos.</p>
              </div>
            }
          </div>
        </ng-template>
      </mat-tab>
    </mat-tab-group>
  `
})
export class ServidorFormComponent implements OnInit {
  // Injeções de dependência
  private readonly servidorService = inject(ServidorService);
  protected readonly servidoresStore = inject(ServidoresStore);
  protected readonly authStore = inject(AuthStore);
  private readonly notificationService = inject(NotificationService);
  private readonly errorHandlerService = inject(ErrorHandlerService);
  private readonly dialogRef = inject(MatDialogRef<ServidorFormComponent>);
  private destroyRef = inject(DestroyRef);

  constructor() {
    // Remove a foto que estiver na memória ao fechar o formn
    this.destroyRef.onDestroy(() => {
      const currentUrl = this.photoUrl();
      if (currentUrl && currentUrl.startsWith('blob:')) {
        URL.revokeObjectURL(currentUrl);
      }
    });

    effect(() => {
      // Atribui valores as variáveis locais effect
      const selectedId = this.servidorForm.vinculoId().value();
      const vinculoList = this.servidoresStore.vinculos();

      untracked(() => {
        if (!selectedId || vinculoList.length === 0) return;
        // atribui valores as variáveis locais do untracked
        const selectedVinculo = vinculoList.find(
          opt => opt.id === selectedId
        );
        const vinculoName = (selectedVinculo?.nome || '').toLowerCase();
        const currentMatricula = this.servidorForm.matricula().value();

        const isManualMatricula = vinculoName
          .includes('comissionado') || vinculoName.includes('efetivo');

        // --- CENÁRIO: MUDOU PARA TERCEIRIZADO ---
        if (!isManualMatricula) {

          // Se a matrícula atual ainda não é "T", guardamos ela como original caso não tenha sido salva
          if (currentMatricula && !currentMatricula.startsWith('T') && !this.originMatricula) {
            this.originMatricula = currentMatricula;
            this.originVinculoId = selectedId;
          }

          const novaMatricula = this.cacheMatriculaTerceirizado || this.gerarMatriculaTerceirizado();
          this.cacheMatriculaTerceirizado = novaMatricula;

          this.servidorForm.matricula().controlValue.set(novaMatricula);

          // Se já temos um "T" no cache, restauramos. Senão, geramos um novo.
          // if (this.cacheMatriculaTerceirizado) {
          //   this.servidorForm.matricula().controlValue.set(this.cacheMatriculaTerceirizado);
          //   // this.servidorForm.matricula().value.set(this.cacheMatriculaTerceirizado);
          // } else if (!currentMatricula?.startsWith('T')) {
          //   const newMatricula = this.gerarMatriculaTerceirizado();
          //   this.cacheMatriculaTerceirizado = newMatricula;
          //   this.servidorForm.matricula().value.set(newMatricula);
          // }

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

  // Recebemos um "any" para suportar o DTO direto (legado) ou o novo wrapper
  readonly dialogData = inject<any>(MAT_DIALOG_DATA, { optional: true });
  readonly DEFAULT_PHOTO = '/img/default_photo.jpg';

  isReactivate = this.dialogData?.action === 'REACTIVATE';

  // Lógica de extração de dados e estado do formulário
  payload: ServidorResponseDTO | undefined = this.isReactivate
    ? this.dialogData?.payload
    : this.dialogData;

  // É edição se tem payload mas NÃO é readmissão
  isEdit = !!this.payload && !this.isReactivate;

  // Controle para avisar a tabela pai se precisamos recarregar o grid
  private hasCreated = false;

  //  Atualizado para buscar do this.payload ao invés do this.data
  private originMatricula: string | undefined = this.payload?.matricula;
  private originVinculoId: number | undefined = this.payload?.vinculo?.id;
  private cacheMatriculaTerceirizado: string | null = null;

  // Recebe o ID do usuário atual e caso não exista, recebe null
  currentServidorId = signal<number | undefined>(this.payload?.id || undefined);

  // Signals de controle da foto
  photoUrl = signal<string>(this.DEFAULT_PHOTO);
  isUploadingPhoto = signal<boolean>(false);
  // servidorId = signal<number | null>(null);

  // Modelo para validação
  servidorModel = signal<FormModel>(initialDataServidor);

  // Formulário
  servidorForm = form(this.servidorModel, subscriptionSchema);

  // Signal que vai monitorar se houve mudanças nos dados do formulário
  private readonly initialValue = signal<FormModel>(
    structuredClone(this.servidorModel())
  );

  // Computed que compara os dados iniciais do formulário vindos do backend,
  // com os dados atuais do formulário. Se forem diferentes, retorna verdadeiro
  readonly hasCreateds = computed(() => {
    return JSON.stringify(this.initialValue()) !== JSON.stringify(this.servidorModel());
  });

  // Computed para ocultar partes do html (botões, divs, etc) se o usuário não for administrador
  isAdminLogged = computed(() => {
    const user = this.authStore.currentUser();
    if (!user) return;
    return user.roles?.some((p) => p === 'admin');
  });

  // Método genérico que controla mudanças nos campos autocomplete
  onAutocompleteChange(field: keyof ServidorRequestDTO, id: number | null) {
    this.servidorModel.update((m) => ({
      ...m,
      [field]: id as number
    }));
  }

  ngOnInit() {
    // Se não houver ID, não faz nada
    if (!this.currentServidorId()) return;

    // Passa o ID atual do objeto servidor para o método que carrega a foto
    this.loadPhotoServidor(this.currentServidorId()!);

    if (this.payload) {
      this.inicializarFormularioComPayload();
    }

    // Seta o signal com os dados que vieram do backend
    this.initialValue.set(
      structuredClone(this.servidorModel())
    );
  }

  // Salva ou Atualiza um registro com todos os dados de um funcionário
  async salvar() {
    if (this.isEdit && !this.isReactivate && !this.hasCreateds()) {
      this.notificationService.info('Nenhum dado foi alterado.', 'Atualização');
      this.dialogRef.close(false);
      return;
    }
    // Obtemos os valores diretos do Signal de Modelo Atualizado
    const requestData = this.servidorModel() as ServidorRequestDTO;

    // Preparamos a variável no tipo exato que o seu DTO aceita
    let dataFormated: string | undefined = undefined;

    // Só tentamos converter se o usuário de fato preencheu a data
    if (requestData.dataNascimento) {
      // 1. Lemos a string do input (DD/MM/YYYY) usando fromFormat
      // 2. Convertemos para o padrão do banco (YYYY-MM-DD) usando toISODate()
      const conversationLuxon =
        DateTime.fromFormat(requestData.dataNascimento, 'dd/MM/yyyy').toISODate();

      // Garantimos que não passaremos 'null' para satisfazer o TypeScript
      dataFormated = conversationLuxon !== null ? conversationLuxon : undefined;
    }

    const dataPayload = {
      ...requestData,
      dataNascimento: dataFormated
    };

    // 3. Define qual é a ação que a Store deve tomar
    const actionType
      = this.isReactivate ? 'REACTIVATE' : (this.isEdit ? 'UPDATE' : 'CREATE');

    const servId = this.currentServidorId(); // Lê o ID atual do signal

    // 4. DELEGAÇÃO: A Store faz o trabalho pesado
    this.servidoresStore.saveServidor({
      action: actionType,
      servidorId: servId,
      payload: dataPayload,

      onSuccess: (response) => {
        // Callback executado apenas se a API retornou sucesso(200/201)

        if (actionType === 'CREATE') {
          // Atualiza estado local da UI para liberar abas de anexos
          this.hasCreated = true;
          this.currentServidorId.set(response.id);
          this.isEdit = true;

          // IMPORTANTE: Removi o dialogRef.close() daqui para que
          // o modal continue aberto e o usuário anexe os documentos!
          // Caso a regra seja fechar mesmo, basta adicionar this.dialogRef.close(response);
        } else {
          // Se for update ou reactivate, fecha o modal
          this.dialogRef.close(response);
        }
      }
    });
  }

  atualizarPermissoesNoModeloPai(event: { sistemaIds: number[], procuradorIds: number[], aliasIds: number[] }) {
    this.servidorModel.update(modeloAtual => ({
      ...modeloAtual,
      ...event
    }));
  }

  // Fecha o modal ServidorForm
  closeModal() {
    this.dialogRef.close(this.hasCreated);
  }

  loadPhotoServidor(id: number) {
    this.servidorService.downloadPhoto(id)
      .subscribe({
        next: (blob) => {
          const objectUrl = URL.createObjectURL(blob);
          this.photoUrl.set(objectUrl);
        },
        error: (err) => {
          if (err.status !== 404) {
            this.errorHandlerService.handle(err, 'Baixar foto');
          }
        }
      });
  }

  onSelectedPhoto(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    // const id = this.payload?.id;
    const id = this.currentServidorId();

    if (!id) {
      this.notificationService.error(
        'Salve o servidor primeiro antes de anexar uma foto.',
        'Anexar foto');
      return;
    }

    // 🛡Fail-Fast 1: Tipo do Arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

    if (!allowedTypes.includes(file.type)) {
      this.notificationService.error(
        'Formato inválido. Selecione uma imagem JPG ou PNG.',
        'Erro extensão');
      return;
    }

    // 🛡Fail-Fast 2: Tamanho do Arquivo (1MB = 1048576 bytes)
    if (file.size > 1048576) {
      this.notificationService.error(
        'A foto é muito grande. O tamanho máximo é 1MB.',
        'Tamanho arquivo');
      return;
    }

    // Preview Instantâneo na Tela
    const reader = new FileReader();

    reader.onload = (e) => {
      this.photoUrl.set(e.target?.result as string); // Atualiza a foto na tela na hora!
    };

    reader.readAsDataURL(file);

    // Upload Silencioso
    this.isUploadingPhoto.set(true);

    this.servidorService.uploadProfilePicture(id, file)
      .pipe(
        switchMap(() => {
          const chacheBuster = Date.now();
          return this.servidorService.downloadPhoto(id, chacheBuster);
        }),
        finalize(() => this.isUploadingPhoto.set(false))
      )
      .subscribe({
        next: (blob) => {
          const oldUrl = this.photoUrl();

          if (oldUrl && oldUrl.startsWith('blob:')) {
            URL.revokeObjectURL(oldUrl);
          }

          this.photoUrl.set(URL.createObjectURL(blob));
          this.notificationService.success('Foto atualizada com sucesso!',
            'Anexar foto');
        },
        error: (err) => {
          this.errorHandlerService.handle(err, 'Upload de Foto');
          // Se der erro, volta para a foto original/padrão
          this.loadPhotoServidor(id);
        }
      });
  }

  // MÉTHOD AUXILIAR: Gera um código no formato "T" + 3 ou 4 dígitos aleatórios
  private gerarMatriculaTerceirizado(): string {
    // Gera um número entre 10000 e 99999
    const randomNumber = Math.floor(100 + Math.random() * 900);
    return `T${randomNumber}`;
  }

  private inicializarFormularioComPayload() {
    try {
      // 1. Extração simplificada de relacionamentos múltiplos
      const sistemaIds = this.payload?.sistemas?.map((s: any) => s.id) || [];
      const procuradorIds = this.payload?.procuradores?.map((p: any) => p.id) || [];
      const aliasIds = this.payload?.aliases?.map((a: any) => a.id) || [];

      // 2. Conversão da Data com Luxon (Preservando sua excelente blindagem de fuso horário)
      const dataNascimentoFormatada = this.payload?.dataNascimento
        ? DateTime.fromISO(this.payload.dataNascimento).toFormat('dd/MM/yyyy')
        : '';

      // 3. Atualiza o seu modelo de formulário baseado em Signals
      this.servidorModel.update((m) => ({
        ...m,
        ...this.payload,
        dataNascimento: dataNascimentoFormatada,

        // Mapeamento limpo usando o operador de coalescência nula (??) do TypeScript moderno
        // Substitui o "as unknown as number" que era usado para burlar o compilador
        cargoId: this.payload?.cargo?.id ?? null as any,
        setorId: this.payload?.setor?.id ?? null as any,
        lotacaoId: this.payload?.lotacao?.id ?? null as any,
        statusId: this.payload?.status?.id ?? null as any,
        vinculoId: this.payload?.vinculo?.id ?? null as any,

        sistemaIds,
        procuradorIds,
        aliasIds
      }));

    } catch (err) {
      this.errorHandlerService.handle(err, 'Carregamento de Dados');
      console.error('Dados problemáticos recebidos no formulário:', this.payload);
    }
  };

  get isTerceirizado(): boolean {
    const idSelecionado = this.servidorForm.vinculoId().value();
    const vinculo = this.servidoresStore.vinculos()
      .find(v => v.id === idSelecionado);

    const name = vinculo?.nome.toLowerCase();

    return (
      name !== 'comissionado' && name !== 'efetivo'
    );
  }

  protected readonly Number = Number;
}
