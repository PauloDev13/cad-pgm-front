import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MESES_DO_ANO } from '../../../models/aniversariente.model';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { DominioService } from '../../../../servidor/services/dominio.service';
import { AutocompleteComponent } from '../../../../../shared/components/autocomplete/autocomplete.component';

@Component({
  selector: 'app-folha-ponto-modal.component',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    AutocompleteComponent
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div mat-dialog-title class="!flex !justify-between !items-center !px-6 !pt-4 !pb-2 !m-0">
      <h2 mat-dialog-title
          class="!font-bold !text-lg sm:!text-xl !text-blue-800 !m-0 !p-0 !text-left flex-1">
        Emitir Folhas de Ponto
      </h2>
    </div>

    <mat-dialog-content class="pt-4 flex flex-col gap-4">
      <p class="mb-4 text-base text-gray-600">Selecione o mês de referência e o Setor.</p>

      <mat-form-field
        appearance="outline"
        subscriptSizing="dynamic"
        class="w-full mb-8">
        <mat-label>Mês</mat-label>
        <mat-select
          [value]="mesSelecionado()"
          (selectionChange)="mesSelecionado.set($event.value)">

          @for (mes of meses; track mes.id) {
            <mat-option [value]="mes.id">{{ mes.nome }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <app-list-autocomplete
        class="gap-8"
        [data]="setores()"
        label="Setor"
        placeholder="Pesquisar Setor"
        [(selectedId)]="setorSelecionado"
      />
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
export class FolhaPontoModalComponent {
  private readonly dominioService = inject(DominioService);
  protected readonly dialogRef = inject(MatDialogRef<FolhaPontoModalComponent>);

  meses = MESES_DO_ANO;
  anoCorrente = new Date().getFullYear();

  mesSelecionado = signal<number | null>(null);
  setorSelecionado = signal<number | null>(null);

  setores = computed(() =>
    this.dominioService.setoresResource.value() ?? []);

  isLoading = this.dominioService.setoresResource.isLoading;

  confirmar() {
    // Devolve um objeto limpo para quem abriu o modal
    this.dialogRef.close({
      mes: this.mesSelecionado(),
      setorId: this.setorSelecionado(),
      ano: this.anoCorrente
    });
  }
}
