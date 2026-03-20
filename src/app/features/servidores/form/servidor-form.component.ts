import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServidorService } from '../../../core/services/servidor.service';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ServidorRequestDTO, ServidorResponseDTO } from '../../../core/models/servidor.model';
import { MatError, MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-servidor-form',
  standalone: true,
  imports: [
    MatError,
    MatDialogContent,
    MatFormField,
    MatDialogActions,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title class="!font-bold !text-xl !pb-0">
      {{ isEdit ? 'Editar Servidor' : 'Novo Servidor' }}
    </h2>
    <mat-dialog-content class="!pt-4">
      <form [formGroup]="form" class="flex flex-col gap-4">
        <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Dados Pessoais
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Nome Completo</mat-label>
            <input matInput formControlName="nome" placeholder="Ex: João da Silva" />
            @if (form.get('nome')?.hasError('required')) {
              <mat-error>O nome é obrigatório</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Matrícula</mat-label>
            <input matInput formControlName="matricula" />
            @if (form.get('matricula')?.hasError('required')) {
              <mat-error>A matrícula é obrigatória</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>CPF</mat-label>
            <input matInput formControlName="cpf" placeholder="Somente números" />
            @if (form.get('cpf')?.hasError('required')) {
              <mat-error>O CPF é obrigatório</mat-error>
            }
            @if (form.get('cpf')?.hasError('pattern')) {
              <mat-error>Deve conter 11 dígitos</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Telefone</mat-label>
            <input matInput formControlName="telefone" />
          </mat-form-field>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>E-mail Pessoal</mat-label>
            <input matInput formControlName="emailPessoal" type="email" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>E-mail Institucional</mat-label>
            <input matInput formControlName="emailInstitucional" type="email" />
          </mat-form-field>
        </div>

        <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mt-4 mb-2">
          Vínculo Funcional
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Cargo ID</mat-label>
            <input matInput formControlName="cargoId" type="number" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Setor ID</mat-label>
            <input matInput formControlName="setorId" type="number" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Lotação ID</mat-label>
            <input matInput formControlName="lotacaoId" type="number" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Status ID</mat-label>
            <input matInput formControlName="statusId" type="number" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Vínculo ID</mat-label>
            <input matInput formControlName="vinculoId" type="number" />
          </mat-form-field>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="!pb-6 !pr-6">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" (click)="save()" [disabled]="form.invalid">
        {{ isEdit ? 'Atualizar' : 'Salvar' }}
      </button>
    </mat-dialog-actions>
  `,
})
export class ServidorFormComponent implements OnInit {
  readonly data = inject<ServidorResponseDTO>(MAT_DIALOG_DATA, { optional: true });
  form!: FormGroup;
  isEdit: boolean = false;
  private readonly fb = inject(FormBuilder);
  private readonly servidorService = inject(ServidorService);
  private readonly dialogRef = inject(MatDialogRef<ServidorFormComponent>);
  private readonly snackBar = inject(MatSnackBar);

  ngOnInit() {
    this.isEdit = !!this.data;
    this.initForm();
    if (this.isEdit && this.data) {
      this.populateForm(this.data);
    }
  }

  save() {
    if (this.form.invalid) return;

    const requestData: ServidorRequestDTO = this.form.value;
    const request$ = this.isEdit
      ? this.servidorService.update(this.data!.id, requestData)
      : this.servidorService.create(requestData);

    request$.subscribe({
      next: () => {
        this.snackBar.open(
          `Servidor ${this.isEdit ? 'atualizado' : 'cadastrado'} com sucesso!`,
          'Fechar',
          { duration: 3000 },
        );
        this.dialogRef.close(true); // Retorna true para a listagem saber que deve recarregar
      },
      error: () => {
        this.snackBar.open('Erro ao salvar dados', 'Fechar', { duration: 3000 });
      },
    });
  }

  private initForm() {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(150)]],
      matricula: ['', [Validators.required, Validators.maxLength(50)]],
      cpf: ['', [Validators.required, Validators.pattern('\\d{11}')]],
      genero: ['', [Validators.maxLength(20)]],
      telefone: ['', [Validators.maxLength(20)]],
      emailPessoal: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      emailInstitucional: ['', [Validators.email, Validators.maxLength(100)]],
      endereco: ['', [Validators.maxLength(255)]],
      filiacao: ['', [Validators.maxLength(255)]],

      // Relações Obrigatórias
      cargoId: [null, Validators.required],
      setorId: [null, Validators.required],
      lotacaoId: [null, Validators.required],
      statusId: [null, Validators.required],
      vinculoId: [null, Validators.required],
    });
  }

  private populateForm(servidor: ServidorResponseDTO) {
    this.form.patchValue({
      ...servidor,
      // Extraindo os IDs das entidades aninhadas para o form
      cargoId: servidor.cargo?.id,
      setorId: servidor.setor?.id,
      lotacaoId: servidor.lotacao?.id,
      statusId: servidor.status?.id,
      vinculoId: servidor.vinculo?.id,
    });
  }
}
