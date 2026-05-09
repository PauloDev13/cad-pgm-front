import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { email, form, FormField, maxLength, minLength, required, submit } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SingleInputDialogData, SingleInputModalResult } from '../../model/generic/base-generic.model';
import { FieldWrapperComponent } from '../../layout/component/field-wrapper/field-wrapper.component';

@Component({
  selector: 'app-custom-cad-modal',
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormField,
    FieldWrapperComponent
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex justify-between items-center px-6 pt-4 pb-2">
      <h2 mat-dialog-title class="!font-bold !text-lg sm:!text-xl !text-blue-700 !m-0 !p-0">
        {{ isEdit() ? 'Editar' : 'Novo' }} {{ data.title }}
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

    <mat-dialog-content class="!px-6 !pb-2 !pt-2">
      <div class="flex flex-col w-full sm:min-w-[350px]">
        <app-field-wrapper class="!-mb-2" [field]="customForm.fieldValue()">
          <mat-form-field appearance="outline" class="w-full mt-2" subscriptSizing="dynamic">
            <mat-label>{{ data.inputLabel }}</mat-label>
            <input matInput [formField]="customForm.fieldValue" placeholder="Campo obtigtório.." />
          </mat-form-field>
        </app-field-wrapper>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions class="!px-6 !pb-6 !pt-4 flex flex-col sm:flex-row sm:justify-end gap-3">
      <button
        mat-stroked-button
        class="w-full sm:w-auto !transition-transform duration-300 !ease-in-out hover:!scale-105
              !h-12 sm:!h-10 order-2 sm:order-1"
        (click)="close()"
      >
        <mat-icon class="mr-1">close</mat-icon>
        Cancelar
      </button>

      <button
        mat-flat-button
        class="w-full sm:w-auto !bg-blue-600 !text-white !transition-transform duration-300 !
               ease-in-out hover:!scale-105 disabled:!bg-gray-200 disabled:!text-gray-400 !h-12
               sm:!h-10 order-1 sm:order-2"
        [disabled]="customForm().invalid()"
        (click)="save()"
      >
        <mat-icon class="mr-1">save</mat-icon>
        {{ isEdit() ? 'Atualizar' : 'Salvar' }}
      </button>
    </mat-dialog-actions>
  `
})
export class CustomCadModalComponent implements OnInit {
  dialogRef = inject(MatDialogRef<CustomCadModalComponent>);
  data = inject<SingleInputDialogData>(MAT_DIALOG_DATA);

  isEdit = signal<boolean>(false);

  // Inicializa o modelo de dados para o formulário
  customModel = signal<{ fieldValue: string }>({
    fieldValue: ''
  });

  // cria o formulário e suas validações
  customForm = form(this.customModel, (path) => {
    // validações para o campo Nome
    required(path.fieldValue, { message: `O campo ${this.data.inputLabel} é obrigatório` });
    minLength(path.fieldValue, 5, {
      message: `O campo ${this.data.inputLabel} deve ter no mínimo 5 caracteres`
    });
    maxLength(path.fieldValue, 150, {
      message: `O campo ${this.data.inputLabel} deve ter no máximo 150 caracteres`
    });

    if (this.data.inputLabel.trim().toLowerCase() === 'email') {
      email(path.fieldValue, { message: 'E-mail inválido' });
    }
  });

  ngOnInit() {
    // Se o Pai mandou um 'element', significa que o usuário clicou em Editar!
    if (this.data.id) {
      this.isEdit.set(true);
      // Atualiza o valor do Signal Form com os dados de element
      this.customModel.update((m) => ({
        ...m,
        fieldValue: this.data.inputValue
      }));
    }
  }

  close() {
    this.dialogRef.close();
  }

  // emite os dados do formulário para o componente pai
  async save() {
    await submit(this.customForm, async () => {
      const payload = this.customForm().controlValue().fieldValue;
      const result: SingleInputModalResult = {
        id: this.data.id,
        value: payload
      };

      this.dialogRef.close(result);
    });
  }
}
