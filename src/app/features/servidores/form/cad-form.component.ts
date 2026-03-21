import { Component, inject, OnInit, signal } from '@angular/core';
import { ServidorService } from '../../../core/services/servidor.service';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ServidorRequestDTO, ServidorResponseDTO } from '../../../core/models/servidor.model';
import {
  email,
  form,
  FormField,
  maxLength,
  minLength,
  pattern,
  required,
  submit,
} from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

type FormModel = Required<Omit<ServidorRequestDTO, 'sistemaIds' | 'aliasIds' | 'procuraIds'>>;

@Component({
  selector: 'app-cad-form.component',
  imports: [
    FormField,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  standalone: true,
  template: `
    <h2 mat-dialog-title class="!font-bold !text-xl !pb-0">
      {{ isEdit ? 'Editar Servidor' : 'Novo Servidor' }}
    </h2>
    <mat-dialog-content class="!pt-4">
      <form class="flex flex-col gap-5">
        <div>
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Dados Pessoais
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="flex flex-col">
              <!--Campo nome-->
              <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                <mat-label>Nome Completo</mat-label>
                <input matInput [formField]="servidorForm.nome" placeholder="Ex: João da Silva" />
              </mat-form-field>
              @if (servidorForm.nome().invalid() && servidorForm.nome().touched()) {
                @for (error of servidorForm.nome().errors(); track error) {
                  <mat-error class="pl-3">{{ error.message }}</mat-error>
                }
              }
            </div>
            <!--Campo filiação-->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Filiação (Nome da Mãe/Pai)</mat-label>
              <input matInput [formField]="servidorForm.filiacao" />
            </mat-form-field>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-3 mt-1">
            <div class="flex flex-col">
              <!--Campo matrícula-->
              <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                <mat-label>Matrícula</mat-label>
                <input matInput [formField]="servidorForm.matricula" />
              </mat-form-field>
              @if (servidorForm.matricula().invalid() && servidorForm.matricula().touched()) {
                @for (error of servidorForm.matricula().errors(); track error) {
                  <mat-error class="pl-3">{{ error.message }}</mat-error>
                }
              }
            </div>

            <div class="flex flex-col">
              <!--Campo CPF-->
              <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                <mat-label>CPF</mat-label>
                <input matInput [formField]="servidorForm.cpf" placeholder="Somente números" />
              </mat-form-field>
              @if (servidorForm.cpf().invalid() && servidorForm.cpf().touched()) {
                @for (error of servidorForm.cpf().errors(); track error) {
                  <mat-error class="pl-3">{{ error.message }}</mat-error>
                }
              }
            </div>

            <div class="flex flex-col">
              <!--Campo Data Nascimento-->
              <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                <mat-label>Data de Nascimento</mat-label>
                <input
                  matInput
                  [matDatepicker]="pickerNascimento"
                  [formField]="servidorForm.dataNascimento"
                />
                <mat-datepicker-toggle matIconSuffix [for]="pickerNascimento" />
                <mat-datepicker #pickerNascimento></mat-datepicker>
              </mat-form-field>
              @if (
                servidorForm.dataNascimento().invalid() && servidorForm.dataNascimento().touched()
              ) {
                @for (error of servidorForm.dataNascimento().errors(); track error) {
                  <mat-error class="pl-3">{{ error.message }}</mat-error>
                }
              }
            </div>

            <!--Campo genero-->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Gênero</mat-label>
              <input matInput [formField]="servidorForm.genero" placeholder="Ex: Feminino" />
            </mat-form-field>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mt-1">
            <!--Campo telefone-->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Telefone</mat-label>
              <input matInput [formField]="servidorForm.telefone" />
            </mat-form-field>

            <div class="flex flex-col">
              <!--Campo email pessoal-->
              <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                <mat-label>E-mail Pessoal</mat-label>
                <input matInput [formField]="servidorForm.emailPessoal" type="email" />
              </mat-form-field>
              @if (servidorForm.emailPessoal().invalid() && servidorForm.emailPessoal().touched()) {
                @for (error of servidorForm.emailPessoal().errors(); track error) {
                  <mat-error class="pl-3">{{ error.message }}</mat-error>
                }
              }
            </div>

            <!--Campo email institucional-->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>E-mail Institucional</mat-label>
              <input matInput [formField]="servidorForm.emailInstitucional" type="email" />
            </mat-form-field>
          </div>

          <div class="grid grid-cols-1 gap-3 mt-1">
            <!--Campo endereço-->
            <mat-form-field appearance="outline" class="w-full">
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

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!--Campo cargo-->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Cargo ID</mat-label>
              <input matInput [formField]="servidorForm.cargoId" type="number" />
              @if (servidorForm.cargoId().invalid() && servidorForm.cargoId().touched()) {
                <mat-error>{{ servidorForm.cargoId().errors()[0].message }}</mat-error>
              }
            </mat-form-field>

            <!--Campo setor-->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Setor ID</mat-label>
              <input matInput [formField]="servidorForm.setorId" type="number" />
              @if (servidorForm.setorId().invalid() && servidorForm.setorId().touched()) {
                <mat-error>{{ servidorForm.setorId().errors()[0].message }}</mat-error>
              }
            </mat-form-field>

            <!--Campo lotação-->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Lotação ID</mat-label>
              <input matInput [formField]="servidorForm.lotacaoId" type="number" />
              @if (servidorForm.lotacaoId().invalid() && servidorForm.lotacaoId().touched()) {
                <mat-error>{{ servidorForm.lotacaoId().errors()[0].message }}</mat-error>
              }
            </mat-form-field>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
            <mat-form-field appearance="outline" class="w-full">
              <!--Campo status-->
              <mat-label>Status ID</mat-label>
              <input matInput [formField]="servidorForm.statusId" type="number" />
              @if (servidorForm.statusId().invalid() && servidorForm.statusId().touched()) {
                <mat-error>{{ servidorForm.statusId().errors()[0].message }}</mat-error>
              }
            </mat-form-field>

            <!--Campo vínculo-->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Vínculo ID</mat-label>
              <input matInput [formField]="servidorForm.vinculoId" type="number" />
              @if (servidorForm.vinculoId().invalid() && servidorForm.vinculoId().touched()) {
                <mat-error>{{ servidorForm.vinculoId().errors()[0].message }}</mat-error>
              }
            </mat-form-field>
          </div>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="!pb-6 !pr-6">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button
        mat-flat-button
        color="primary"
        (click)="salvar()"
        [disabled]="servidorForm().invalid()"
      >
        {{ isEdit ? 'Atualizar' : 'Salvar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: ``,
})
export class CadFormComponent implements OnInit {
  isEdit: boolean = false;
  readonly data = inject<ServidorResponseDTO>(MAT_DIALOG_DATA, { optional: true });

  private servidorModel = signal<FormModel>({
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
    lotacaoId: null as unknown as number,
    statusId: null as unknown as number,
    vinculoId: null as unknown as number,
  });
  servidorForm = form(this.servidorModel, (path) => {
    required(path.nome, { message: 'O nome é obrigatório' });
    minLength(path.nome, 5, { message: 'O Nome deve ter no mínimo 5 caracteres' });
    maxLength(path.nome, 150, {
      message: 'O nome deve ter no máximo 150 caracteres',
    });

    required(path.matricula, { message: 'A matrícula é obrigatório' });
    maxLength(path.matricula, 20, {
      message: 'A matrícula deve ter no máximo 20 caracteres',
    });

    required(path.cpf, { message: 'O CPF é obrigatório' });
    pattern(path.cpf, /^\d{11}$/, { message: 'O CPF deve ter 11 digitos' });

    required(path.dataNascimento, { message: 'A Data de Nascimento é obrigatório' });

    maxLength(path.telefone, 20, {
      message: 'O telefone deve ter no máximo 20 digitos',
    });

    required(path.emailPessoal, { message: 'O Email é obrigatório' });
    email(path.emailPessoal, { message: 'Formato de email inválido' });
    maxLength(path.emailPessoal, 100, {
      message: 'O Email deve ter no máximo 100 caracteres',
    });

    maxLength(path.emailInstitucional, 100, {
      message: 'O Email deve ter no máximo 100 caracteres',
    });
    email(path.emailInstitucional, { message: 'Formato de email inválido' });

    required(path.cargoId, { message: 'O Cargo é obrigatório' });
    required(path.setorId, { message: 'O Setor é obrigatório' });
    required(path.lotacaoId, { message: 'A Lotação é obrigatório' });
    required(path.statusId, { message: 'O Status é obrigatório' });
    required(path.vinculoId, { message: 'O vinculo é obrigatório' });
  });
  private readonly servidorService = inject(ServidorService);
  private readonly dialogRef = inject(MatDialogRef<CadFormComponent>);
  private readonly snackBar = inject(MatSnackBar);

  ngOnInit() {
    this.isEdit = !!this.data;

    if (this.isEdit && this.data) {
      this.servidorModel.update((m) => ({
        ...m,
        ...this.data,
        // ---> CONVERSÃO DA DATA <---
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
      }));
    }
  }

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

        this.snackBar.open(
          `Servidor ${this.isEdit ? 'atualizado' : 'cadastrado'} com sucesso!`,
          'Fechar',
          {
            duration: 3000,
            panelClass: ['snackbar-success'],
          },
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
        this.snackBar.open(messageDefaultErro, 'Fechar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['danger'],
        });
      }
    });
  }
}
