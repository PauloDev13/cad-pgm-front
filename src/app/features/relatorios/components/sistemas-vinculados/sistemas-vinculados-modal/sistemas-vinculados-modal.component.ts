import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DominioService } from '../../../../servidor/services/dominio.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-sistemas-vinculados-modal',
  imports: [MatDialogModule, MatButtonModule, MatFormFieldModule, MatSelectModule],
  template: `
    <div mat-dialog-title class="!flex !justify-between !items-center !px-6 !pt-4 !pb-2 !m-0">
      <h2 class="!font-bold !text-lg sm:!text-xl !text-blue-800 !m-0 !p-0 !text-left flex-1">
        Sistemas Vinculados
      </h2>
    </div>

    <mat-dialog-content class="pt-4 flex flex-col gap-4">
      <p class="mb-2 text-base text-gray-600">
        Selecione os sistemas para filtrar ou deixe em branco para listar todos.
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

    <mat-dialog-actions align="end" class="pb-4 pr-4">
      <button mat-button mat-dialog-close class="text-gray-600 !rounded-3xl">
        Cancelar
      </button>
      <button mat-flat-button color="primary" class="!rounded-3xl" (click)="confirmar()">
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
