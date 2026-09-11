import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { DominioService } from '../../../../servidor/services/dominio.service';

@Component({
  selector: 'app-certificados-vinculados-modal',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div mat-dialog-title class="!flex !justify-between !items-center !px-6 !pt-4 !pb-2 !m-0">
      <h2 class="!font-bold !text-lg sm:!text-xl !text-blue-800 !m-0 !p-0 !text-left flex-1">
        Certificados Vinculados
      </h2>
    </div>
    <mat-dialog-content class="pt-4 flex flex-col gap-4">
      <p class="mb-2 text-base text-gray-600">
        Selecione os procuradores para filtrar ou deixe em branco para listar todos.
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
    <mat-dialog-actions align="end" class="pb-4 pr-4">
      <button mat-button mat-dialog-close class="text-gray-600">Cancelar</button>
      <button mat-flat-button color="primary" (click)="confirmar()">
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
