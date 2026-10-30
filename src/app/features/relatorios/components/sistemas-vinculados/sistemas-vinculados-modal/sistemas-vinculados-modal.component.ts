import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DominioService } from '../../../../servidor/services/dominio.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-sistemas-vinculados-modal',
  imports: [MatDialogModule, MatButtonModule, MatFormFieldModule, MatSelectModule, MatIcon],
  template: `
    <div class="flex justify-between items-center pr-6 pt-0 pb-0 border-gray-300 border-b">
      <h2
        mat-dialog-title
        class="!font-bold !text-lg !text-blue-700 !m-0 !flex !items-center">
        <mat-icon class="!mr-1">dns</mat-icon>
        Sistemas Vinculados
      </h2>
      <button
        mat-icon-button
        mat-dialog-close
        class="!w-7 !h-7 !flex !items-center !justify-center !bg-blue-600 hover:!bg-blue-500
        !text-white !rounded-full"
      >
        <mat-icon class="!scale-70">close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="!pt-4 !flex !flex-col gap-0">
      <p class="mb-2 text-base text-gray-600">
        Selecione os itens para filtrar ou nenhum para listar todos
      </p>

      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full mb-4">
        <mat-label>Sistemas (Opcional - vazio para todos)</mat-label>
        <mat-select
          multiple
          [value]="sistemasSelecionados()"
          (selectionChange)="sistemasSelecionados.set($event.value)">

          @for (sistema of sistemasDisponiveis(); track sistema.id) {
            <mat-option [value]="sistema.nome">{{ sistema.nome }}</mat-option>
          }

        </mat-select>
      </mat-form-field>
    </mat-dialog-content>

    <mat-dialog-actions
      align="end"
      class="!px-6 !py-3 !mt-4 bg-gray-50 !border-t !border-gray-300">
      <button
        mat-button
        mat-dialog-close
        class="text-gray-600 !rounded-3xl">
        Cancelar
      </button>
      <button
        mat-flat-button
        color="primary"
        class="!rounded-3xl"
        (click)="confirmar()">
        Continuar
      </button>
    </mat-dialog-actions>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SistemasVinculadosModalComponent {
  private readonly dialogRef = inject(MatDialogRef<SistemasVinculadosModalComponent>);
  private readonly dominioService = inject(DominioService);

  readonly sistemasDisponiveis = this.dominioService.sistemasResource.value;
  readonly sistemasSelecionados = signal<string[]>([]);

  confirmar(): void {
    this.dialogRef.close({ sistemas: this.sistemasSelecionados() });
  }
}
