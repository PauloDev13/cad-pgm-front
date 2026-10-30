import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { DominioService } from '../../../../servidor/services/dominio.service';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-certificados-vinculados-modal',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIcon
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex justify-between items-center pr-6 pt-0 pb-0 border-gray-300 border-b">
      <h2
        mat-dialog-title
        class="!font-bold !text-lg !text-blue-700 !m-0 !flex !items-center">
        <mat-icon class="!mr-1">verified_user</mat-icon>
        Certificados Vinculados
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
        Selecione um ou mais itens para filtrar ou nenhum para listar todos
      </p>
      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full mb-4">
        <mat-label>Procuradores (Opcional - vazio para todos)</mat-label>
        <mat-select
          multiple
          [value]="procuradoresSelecionados()"
          (selectionChange)="procuradoresSelecionados.set($event.value)">
          @for (procurador of procuradoresDisponiveis(); track procurador.id) {
            <mat-option [value]="procurador.nome">{{ procurador.nome }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>

    <mat-dialog-actions
      align="end"
      class="!px-6 !mt-4 !py-3 bg-gray-50 !border-t !border-gray-300">
      <button mat-button mat-dialog-close class="text-gray-600 !rounded-3xl">Cancelar</button>
      <button mat-flat-button class="!rounded-3xl" color="primary" (click)="confirmar()">
        Continuar
      </button>
    </mat-dialog-actions>
  `
})
export class CertificadosVinculadosModalComponent {
  private readonly dialogRef = inject(
    MatDialogRef<CertificadosVinculadosModalComponent>
  );
  private readonly dominioService = inject(DominioService);

  // Lista de procuradores carregada via rxResource existente no DominioService
  procuradoresDisponiveis = this.dominioService.procuradoresResource.value;
  procuradoresSelecionados = signal<string[]>([]);

  confirmar(): void {
    this.dialogRef.close({
      procuradores: this.procuradoresSelecionados()
    });
  }
}
