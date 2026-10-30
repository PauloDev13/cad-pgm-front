import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MESES_DO_ANO } from '../../../models/aniversariente.model';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { DominioService } from '../../../../servidor/services/dominio.service';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-folha-ponto-modal.component',
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
    <div
      class="flex justify-between items-center pr-6 pt-0 pb-0 border-gray-300 border-b">
      <h2
        mat-dialog-title
        class="!font-bold !text-lg !text-blue-700 !m-0 !flex !items-center">
        <mat-icon class="!mr-1">assignment</mat-icon>
        Emitir Folhas de Ponto
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
      <p class="mb-2 text-base text-gray-600">Selecione o mês de referência</p>

      <!--  Combo com meses-->
      <mat-form-field
        appearance="outline"
        subscriptSizing="dynamic"
        class="w-full mb-4">
        <mat-label>Mês</mat-label>
        <mat-select
          [value]="mesSelecionado()"
          (selectionChange)="mesSelecionado.set($event.value)">

          @for (mes of meses; track mes.id) {
            <mat-option [value]="mes.id">{{ mes.nome }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <p class="mb-2 text-base text-gray-600">
        Selecione um ou mais itens para filtrar ou nenhum para listar todos
      </p>
      <!--  Combo com setores-->
      <mat-form-field
        appearance="outline"
        subscriptSizing="dynamic"
        class="w-full mb-4">
        <mat-label>Setores (Opcional - vazio para todos</mat-label>
        <mat-select
          multiple
          [value]="setoresSelecionados()"
          (selectionChange)="setoresSelecionados.set($event.value)">

          @for (setor of setoresDisponiveis(); track setor.id) {
            <mat-option [value]="setor.id">{{ setor.nome }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>

    <mat-dialog-actions
      align="end"
      class="!px-6 !py-3 !mt-4 bg-gray-50 !border-t !border-gray-300">
      <button
        class="!rounded-3xl"
        mat-button
        mat-dialog-close>
        Cancelar
      </button>
      <button
        mat-flat-button
        class="!rounded-3xl"
        color="primary"
        [disabled]="!mesSelecionado()"
        (click)="confirmar()">
        Continuar
      </button>
    </mat-dialog-actions>
  `
})
export class FolhaPontoModalComponent {
  protected readonly dialogRef = inject(MatDialogRef<FolhaPontoModalComponent>);
  protected readonly dominioService = inject(DominioService);

  setoresDisponiveis = this.dominioService.setoresResource.value;
  setoresSelecionados = signal<number[]>([]);

  meses = MESES_DO_ANO;
  anoCorrente = new Date().getFullYear();

  mesSelecionado = signal<number | null>(null);

  confirmar() {
    // Devolve um objeto limpo para quem abriu o modal
    this.dialogRef.close({
      mes: this.mesSelecionado(),
      ano: this.anoCorrente,
      setorIds: this.setoresSelecionados() // Array vazio = Todos os setores
    });
  }
}
