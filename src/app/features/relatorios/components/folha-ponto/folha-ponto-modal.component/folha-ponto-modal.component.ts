import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MESES_DO_ANO } from '../../../models/aniversariente.model';
import { ServidoresStore } from '../../../../servidor/store/servidor.store';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-folha-ponto-modal.component',
  imports: [MatDialogModule, MatButtonModule, MatFormFieldModule, MatSelectModule],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title class="text-gray-800 font-bold">Emitir Folhas de Ponto</h2>

    <mat-dialog-content class="pt-4 flex flex-col gap-4">
      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Mês de Referência</mat-label>
        <mat-select
          [value]="mesSelecionado()"
          (selectionChange)="mesSelecionado.set($event.value)">

          @for (mes of meses; track mes.id) {
            <mat-option [value]="mes.id">{{ mes.nome }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Setor (Obrigatório)</mat-label>
        <mat-select
          [value]="setorSelecionado()"
          (selectionChange)="setorSelecionado.set($event.value)">
          @for (setor of listaSetores(); track setor.id) {
            <mat-option [value]="setor.id">{{ setor.nome }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="pb-4 pr-4">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button
        mat-flat-button color="primary"
        [disabled]="!mesSelecionado() || !setorSelecionado()"
        (click)="confirmar()">
        Continuar
      </button>
    </mat-dialog-actions>
  `
})
export class FolhaPontoModalComponent implements OnInit {
  protected readonly servidoresStore = inject(ServidoresStore);
  protected readonly dialogRef = inject(MatDialogRef<FolhaPontoModalComponent>);

  meses = MESES_DO_ANO;
  listaSetores = this.servidoresStore.setores; // Inicialize com os dados do banco

  mesSelecionado = signal<number | null>(null);
  setorSelecionado = signal<number | null>(null);
  anoCorrente = new Date().getFullYear();

  ngOnInit() {
    // Carregue a lista de setores aqui
    if (this.listaSetores.length === 0) {
      this.servidoresStore.loadSetores();
    }
  }

  confirmar() {
    // Devolve um objeto limpo para quem abriu o modal
    this.dialogRef.close({
      mes: this.mesSelecionado(),
      setorId: this.setorSelecionado(),
      ano: this.anoCorrente
    });
  }
}
