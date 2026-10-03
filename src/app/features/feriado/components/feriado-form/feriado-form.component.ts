import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgxMaskDirective } from 'ngx-mask';
import { FieldWrapperComponent } from '../../../../shared/layout/component/field-wrapper/field-wrapper.component';
import { form, FormField, submit } from '@angular/forms/signals';
import { FeriadoRequestDTO, FeriadoResponseDTO, TIPOS_FERIADO } from '../../models/feriado.model';
import { FeriadoService } from '../../services/feriado.service';
import { NotificationService } from '../../../../shared/service/NotificationSnackbar.service';
import { ErrorHandlerService } from '../../../../shared/service/error-handler.service';
import { FeriadoFormModel, initialDataFeriado, subscriptionFeriadoSchema } from '../../utils/subscription-feriado';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-feriado-form',
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatSlideToggleModule,
    NgxMaskDirective,
    FieldWrapperComponent,
    FormField
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex justify-between items-center px-6 pt-4 pb-1">
      <h2 mat-dialog-title class="!font-bold !text-xl !text-blue-700 !m-0 !p-0 flex items-center gap-2">
        <mat-icon class="!text-blue-600">event</mat-icon>
        {{ isEdit ? 'Editar Feriado / Ponto' : 'Novo Feriado / Ponto' }}
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
      <form autocomplete="off" class="flex flex-col gap-4">
        <div>
          <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 border-b pb-1 mt-0">
            Dados da Data Comemorativa
          </h3>
          <div class="flex flex-col gap-y-3 pt-2">
            <!-- Nome / Descrição -->
            <app-field-wrapper [field]="feriadoForm.nome()">
              <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                <mat-label>Descrição do Feriado / Ponto Facultativo</mat-label>
                <input
                  matInput
                  [formField]="feriadoForm.nome"
                  placeholder="Ex: FERIADO - Tiradentes"
                />
              </mat-form-field>
            </app-field-wrapper>
            <!-- Grid: Data (Dia/Mês) e Tipo -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- Data (Dia/Mês) -->
              <app-field-wrapper [field]="feriadoForm.data()">
                <mat-form-field appearance="outline" class="w-full" floatLabel="always" subscriptSizing="dynamic">
                  <mat-label>Data (Dia / Mês)</mat-label>
                  <input
                    matInput
                    [formField]="feriadoForm.data"
                    mask="00/00"
                    [dropSpecialCharacters]="false"
                    placeholder="DD/MM (ex: 21/04)"
                    class="text-center font-bold"
                  />
                  <mat-icon matSuffix class="!text-gray-400">calendar_today</mat-icon>
                </mat-form-field>
              </app-field-wrapper>
              <!-- Tipo do Feriado -->
              <app-field-wrapper [field]="feriadoForm.tipo()">
                <mat-form-field appearance="outline" class="w-full" floatLabel="always" subscriptSizing="dynamic">
                  <mat-label>Tipo</mat-label>
                  <mat-select [formField]="feriadoForm.tipo" placeholder="Selecione o tipo">
                    @for (tipo of tiposFeriado; track tipo.value) {
                      <mat-option [value]="tipo.value">
                        {{ tipo.label }}
                      </mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              </app-field-wrapper>
            </div>
            <!-- Switch Ativo / Considerar no Relatório (Default: true) -->
            <div class="bg-gray-50 border border-gray-200 rounded-xl p-3.5 flex items-center justify-between mt-1">
              <div class="flex flex-col">
                <span class="text-sm font-semibold text-gray-800">Considerar no Relatório de Ponto</span>
                <span class="text-xs text-gray-500">Se ativo, a data será marcada na folha de ponto impressa.</span>
              </div>
              <mat-slide-toggle
                color="primary"
                [checked]="feriadoModel().ativo"
                (change)="onToggleAtivo($event.checked)"
              />
            </div>
          </div>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions class="!px-6 !pb-4 !pt-3 flex flex-col sm:flex-row sm:justify-end items-center gap-3">
      <button
        mat-stroked-button
        class="w-full sm:w-auto !transition-transform duration-300 hover:!scale-105 !h-12 sm:!h-10 order-2 sm:order-1"
        (click)="cancelar()"
        type="button"
      >
        <mat-icon class="mr-1">close</mat-icon>
        Cancelar
      </button>
      <button
        mat-flat-button
        class="w-full sm:w-auto !bg-blue-600 !text-white !transition-transform duration-300 hover:!scale-105 disabled:!bg-gray-200 disabled:!text-gray-400 !h-12 sm:!h-10 order-1 sm:order-2"
        [disabled]="feriadoForm().invalid() || isSaving()"
        (click)="salvar()"
        type="button"
      >
        <mat-icon class="mr-1">{{ isSaving() ? 'hourglass_empty' : 'save' }}</mat-icon>
        {{ isEdit ? 'Atualizar' : 'Salvar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: ``
})
export class FeriadoFormComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<FeriadoFormComponent>);
  protected readonly data = inject<FeriadoResponseDTO | undefined>(MAT_DIALOG_DATA, { optional: true });
  private readonly feriadoService = inject(FeriadoService);
  private readonly notificationService = inject(NotificationService);
  private readonly errorHandlerService = inject(ErrorHandlerService);

  readonly tiposFeriado = TIPOS_FERIADO;
  isEdit = false;
  isSaving = signal<boolean>(false);
  feriadoModel = signal<FeriadoFormModel>(structuredClone(initialDataFeriado));
  feriadoForm = form(this.feriadoModel, subscriptionFeriadoSchema);

  ngOnInit(): void {
    this.isEdit = !!(this.data && this.data.id);

    if (this.isEdit && this.data) {
      // Converte 'MM-dd' para 'dd/MM' na exibição do input
      let dataExibicao = this.data.data;

      if (dataExibicao && dataExibicao.includes('-')) {
        const [mes, dia] = dataExibicao.split('-');
        dataExibicao = `${dia}/${mes}`;
      }

      this.feriadoModel.set({
        nome: this.data.nome,
        tipo: this.data.tipo,
        data: dataExibicao,
        ativo: this.data.ativo ?? true
      });
    }
  }

  onToggleAtivo(checked: boolean): void {
    this.feriadoModel.update(m => ({ ...m, ativo: checked }));
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }

  async salvar(): Promise<void> {
    await submit(this.feriadoForm, async () => {
      this.isSaving.set(true);

      try {
        const formValues = this.feriadoModel();
        // Normaliza a data para 'MM-dd' para salvar no backend
        let dataNormalizada = formValues.data.trim();

        if (dataNormalizada.includes('/')) {
          const [dia, mes] = dataNormalizada.split('/');
          dataNormalizada = `${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
        }

        const payload: FeriadoRequestDTO = {
          nome: formValues.nome.trim(),
          tipo: formValues.tipo,
          data: dataNormalizada,
          ativo: formValues.ativo ?? true
        };

        let response: FeriadoResponseDTO;

        if (this.isEdit && this.data?.id) {
          response = await firstValueFrom(this.feriadoService.update(this.data.id, payload));
          this.notificationService.success('Feriado atualizado com sucesso!', 'Atualização');
        } else {
          response = await firstValueFrom(this.feriadoService.create(payload));
          this.notificationService.success('Feriado cadastrado com sucesso!', 'Cadastro');
        }
        this.dialogRef.close(response);
      } catch (err: unknown) {
        this.errorHandlerService.handle(err, this.isEdit ? 'Atualização de Feriado' : 'Cadastro de Feriado');
      } finally {
        this.isSaving.set(false);
      }
    });
  }
}
