import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { email, form, FormField, maxLength, minLength, required, submit } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SingleInputDialogData, SingleInputModalResult } from '../../model/generic/base-generic.model';
import { FieldWrapperComponent } from '../../layout/component/field-wrapper.component';

@Component({
  selector: 'app-custom-cad-modal.component',
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
    <h2 mat-dialog-title class="!text-xl !font-bold !text-blue-800 !pb-2">
      {{ isEdit() ? 'Editar' : 'Novo' }} {{ data.title }}
    </h2>

    <mat-dialog-content class="!pt-4 !pb-2">
      <div class="flex flex-col w-full min-w-[300px] md:min-w-[400px]">
        <app-field-wrapper class="!-mb-2" [field]="customForm.fieldValue()">
          <mat-form-field appearance="outline" class="w-full mt-2" subscriptSizing="dynamic">
            <mat-label>{{ data.inputLabel }}</mat-label>
            <input matInput [formField]="customForm.fieldValue" placeholder="Campo obtigtório.." />
          </mat-form-field>
        </app-field-wrapper>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="!px-6 !pb-6 !pt-0">
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
  styles: ``
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
        value: this.data.inputValue
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
