import { Component, inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CargoRequestDTO, GenericDialogData } from '../../../core/models/cargo.model';
import { form, FormField, maxLength, minLength, required, submit } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-custom-cad-modal.component',
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormField, // Diretiva do seu Signal Forms
  ],
  standalone: true,
  template: `
    <h2 mat-dialog-title class="!text-xl !font-bold !text-gray-800 !pb-2 border-b">
      {{ isEdit() ? 'Editar' : 'Novo' }} {{ data.title }}
    </h2>

    <mat-dialog-content class="!pt-4 !pb-2">
      <div class="flex flex-col w-full min-w-[300px] md:min-w-[400px]">
        <mat-form-field appearance="outline" class="w-full mt-2" subscriptSizing="dynamic">
          <mat-label>Nome do {{ data.title }}</mat-label>
          <input matInput [formField]="customForm.nome" placeholder="Digite o nome..." />
        </mat-form-field>

        @if (customForm.nome().invalid() && customForm.nome().touched()) {
          <div class="mt-1 pl-2 text-sm font-medium text-red-600">
            @for (error of customForm.nome().errors(); track error) {
              <mat-error>{{ error.message }}</mat-error>
            }
          </div>
        }
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="!px-6 !pb-6 !pt-2">
      <button
        mat-stroked-button
        color="warn"
        class="!transition-transform duration-300 !ease-in-out hover:!scale-105"
        (click)="close()"
      >
        <mat-icon>close</mat-icon>
        Cancelar
      </button>

      <button
        mat-flat-button
        class="!transition-transform duration-300 !ease-in-out hover:!scale-105"
        [disabled]="customForm().invalid()"
        (click)="save()"
      >
        <mat-icon class="!mr-0.5">save</mat-icon>
        {{ isEdit() ? 'Atualizar' : 'Salvar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: ``,
})
export class CustomCadModalComponent implements OnInit {
  dialogRef = inject(MatDialogRef<CustomCadModalComponent>);
  data = inject<GenericDialogData>(MAT_DIALOG_DATA);

  isEdit = signal<boolean>(false);

  // Inicializa o modelo de dados para o formulário
  customModel = signal<CargoRequestDTO>({
    nome: '',
    email: '',
    descricao: '',
  });

  // cria o formulário e suas validações
  customForm = form(this.customModel, (path) => {
    // validações para o campo Nome
    required(path.nome!, { message: 'O nome é obrigatório' });
    minLength(path.nome!, 5, { message: 'O Nome deve ter no mínimo 5 caracteres' });
    maxLength(path.nome!, 150, {
      message: 'O nome deve ter no máximo 150 caracteres',
    });
  });

  ngOnInit() {
    // Se o Pai mandou um 'element', significa que o usuário clicou em Editar!
    if (this.data.element) {
      this.isEdit.set(true);
      // this.customForm.value.set({ nome: this.data.element.nome });
      // Atualiza o valor do Signal Form com os dados de element
      this.customModel.update((m) => ({
        ...m,
        id: this.data.element.id,
        nome: this.data.element?.nome,
        email: this.data.element?.email || '',
        descricao: this.data.element?.descricao || '',
      }));
    }
  }

  close() {
    this.dialogRef.close();
  }

  // emite os dados do formulário para o componente pai
  async save() {
    await submit(this.customForm, async () => {
      const payload = this.customForm().value();

      const result = {
        id: this.data.element.id,
        payload: payload,
      };

      this.dialogRef.close(result);
    });
  }
}
