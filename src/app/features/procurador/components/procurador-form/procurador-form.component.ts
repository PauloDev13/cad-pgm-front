import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { form, FormField, submit } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMaskDirective } from 'ngx-mask';
import { DateTime } from 'luxon';
import { firstValueFrom } from 'rxjs';
import { ProcuradorRequestDTO, ProcuradorResponseDTO, TIPOS_CERTIFICADO } from '../../models/procurador.model';
import {
  initialDataProcurador,
  ProcuradorFormModel,
  subscriptionProcuradorSchema
} from '../../utils/subscription-procurador';
import { ProcuradorService } from '../../services/procurador.service';
import { NotificationService } from '../../../../shared/service/NotificationSnackbar.service';
import { ErrorHandlerService } from '../../../../shared/service/error-handler.service';
import { FieldWrapperComponent } from '../../../../shared/layout/component/field-wrapper/field-wrapper.component';

@Component({
  selector: 'app-procurador-form',
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatTooltipModule,
    NgxMaskDirective,
    FieldWrapperComponent,
    FormField
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex justify-between items-center px-6 pt-4 pb-1">
      <h2 mat-dialog-title class="!font-bold !text-xl !text-blue-700 !m-0 !p-0 flex items-center gap-2">
        <mat-icon class="!text-blue-600">badge</mat-icon>
        {{ isEdit ? 'Editar Procurador' : 'Novo Procurador' }}
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
            Dados do Procurador e Certificado Digital
          </h3>

          <div class="flex flex-col gap-y-3">
            <!-- Nome Completo -->
            <app-field-wrapper [field]="procuradorForm.nome()">
              <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                <mat-label>Nome Completo do Procurador</mat-label>
                <input matInput [formField]="procuradorForm.nome" placeholder="Ex: Dr. Alexandre Ramos" />
              </mat-form-field>
            </app-field-wrapper>

            <!-- Tipo de Certificado e Data de Expedição -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- Tipo Certificado -->
              <app-field-wrapper [field]="procuradorForm.tipoCertificado()">
                <mat-form-field appearance="outline" class="w-full" floatLabel="always" subscriptSizing="dynamic">
                  <mat-label>Tipo de Certificado</mat-label>
                  <mat-select [formField]="procuradorForm.tipoCertificado" placeholder="Selecione o tipo">
                    @for (tipo of tiposCertificado; track tipo.value) {
                      <mat-option [value]="tipo.value">
                        <div class="flex items-center justify-between w-full">
                          <span>{{ tipo.label }}</span>
                          <span
                            class="text-xs text-gray-500 ml-2">({{ tipo.validadeAnos }} {{ tipo.validadeAnos === 1 ? 'ano' : 'anos' }})
                          </span>
                        </div>
                      </mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              </app-field-wrapper>

              <!-- Data de Expedição (Captura dd/MM/yyyy e concatena horário atual no envio) -->
              <app-field-wrapper [field]="procuradorForm.dataExpedicao()">
                <mat-form-field appearance="outline" class="w-full" floatLabel="always" subscriptSizing="dynamic">
                  <mat-label>Data de Expedição</mat-label>
                  <input
                    matInput
                    [formField]="procuradorForm.dataExpedicao"
                    mask="00/00/0000"
                    [dropSpecialCharacters]="false"
                    placeholder="DD/MM/AAAA"
                  />
                </mat-form-field>
              </app-field-wrapper>
            </div>

            <!-- Card Informativo de Validade e Expiração Calculada -->
            <div class="bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex items-start gap-3 mt-1">
              <mat-icon class="!text-blue-600 shrink-0 mt-0.5">verified_user</mat-icon>
              <div class="flex-1 text-xs text-blue-900 leading-relaxed">
                <div class="font-semibold text-sm text-blue-950 mb-0.5">
                  Vigência do Certificado ({{ procuradorModel().tipoCertificado }})
                </div>
                @if (dataExpiracaoFormatada()) {
                  <p class="m-0">
                    Data prevista de expiração:
                    <strong class="text-blue-800 font-bold">{{ dataExpiracaoFormatada() }}</strong>
                    <span class="text-blue-600 ml-1">
                      ({{ procuradorModel().tipoCertificado === 'A1' ? '1 ano após a expedição' : '3 anos após a expedição' }})
                    </span>
                  </p>
                } @else {
                  <p class="text-blue-700 m-0">
                    Informe a data de expedição no formato DD/MM/AAAA para visualizar a data estimada de expiração.
                  </p>
                }
              </div>
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
        [disabled]="procuradorForm().invalid() || isSaving()"
        (click)="salvar()"
        type="button"
      >
        <mat-icon class="mr-1">{{ isSaving() ? 'hourglass_empty' : 'save' }}</mat-icon>
        {{ isEdit ? 'Atualizar' : 'Salvar' }}
      </button>
    </mat-dialog-actions>
  `
})
export class ProcuradorFormComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<ProcuradorFormComponent>);
  protected readonly data = inject<ProcuradorResponseDTO | undefined>(MAT_DIALOG_DATA, { optional: true });
  private readonly procuradorService = inject(ProcuradorService);
  private readonly notificationService = inject(NotificationService);
  private readonly errorHandlerService = inject(ErrorHandlerService);

  readonly tiposCertificado = TIPOS_CERTIFICADO;
  isEdit = false;
  isSaving = signal<boolean>(false);

  // Signal com o modelo do formulário
  procuradorModel = signal<ProcuradorFormModel>(structuredClone(initialDataProcurador));

  // Formulário baseado em Signals
  procuradorForm = form(this.procuradorModel, subscriptionProcuradorSchema);

  // Data de expiração calculada dinamicamente com Luxon para feedback em tempo real
  dataExpiracaoFormatada = computed(() => {
    const expedicao = this.procuradorModel().dataExpedicao?.trim();
    const tipo = this.procuradorModel().tipoCertificado;

    if (!expedicao || expedicao.length !== 10) return null;

    const dt = DateTime.fromFormat(expedicao, 'dd/MM/yyyy');
    if (!dt.isValid) return null;

    const validadeAnos = tipo === 'A3' ? 3 : 1;
    const expiracao = dt.plus({ years: validadeAnos });

    return expiracao.toFormat('dd/MM/yyyy');
  });

  ngOnInit(): void {
    this.isEdit = !!(this.data && this.data.id);

    if (this.isEdit && this.data) {
      // Converte a data ISO vinda do backend (YYYY-MM-DDTHH:mm:ss) para formato visual (DD/MM/YYYY)
      let expedicaoLocal = '';
      if (this.data.dataExpedicao) {
        const dt = DateTime.fromISO(this.data.dataExpedicao);
        if (dt.isValid) {
          expedicaoLocal = dt.toFormat('dd/MM/yyyy');
        }
      }

      this.procuradorModel.set({
        nome: this.data.nome || '',
        tipoCertificado: this.data.tipoCertificado || 'A1',
        dataExpedicao: expedicaoLocal
      });
    }
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }

  async salvar(): Promise<void> {
    await submit(this.procuradorForm, async () => {
      this.isSaving.set(true);
      try {
        const formValues = this.procuradorModel();

        // 1. Interpreta a data digitada (DD/MM/YYYY)
        const dt = DateTime.fromFormat(formValues.dataExpedicao.trim(), 'dd/MM/yyyy');
        if (!dt.isValid) {
          throw new Error('Data de expedição inválida.');
        }

        // 2. Captura hora, minuto e segundo atuais do sistema
        const agora = DateTime.now();
        const dataExpedicaoComHora = dt.set({
          hour: agora.hour,
          minute: agora.minute,
          second: agora.second,
          millisecond: 0
        });

        // 3. Gera formato ISO completo: YYYY-MM-DDTHH:mm:ss
        const dataExpedicaoIso = dataExpedicaoComHora.toFormat("yyyy-MM-dd'T'HH:mm:ss");

        const payload: ProcuradorRequestDTO = {
          nome: formValues.nome.trim(),
          tipoCertificado: formValues.tipoCertificado,
          dataExpedicao: dataExpedicaoIso
        };

        let response: ProcuradorResponseDTO;

        if (this.isEdit && this.data?.id) {
          response = await firstValueFrom(this.procuradorService.update(this.data.id, payload));
          this.notificationService.success('Procurador atualizado com sucesso!', 'Atualização');
        } else {
          response = await firstValueFrom(this.procuradorService.create(payload));
          this.notificationService.success('Procurador cadastrado com sucesso!', 'Cadastro');
        }

        this.dialogRef.close(response);
      } catch (err: any) {
        this.errorHandlerService.handle(err, this.isEdit ? 'Atualização de Procurador' : 'Cadastro de Procurador');
      } finally {
        this.isSaving.set(false);
      }
    });
  }
}

