import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ServidorResponseDTO } from '../../models/servidor.model';
import { LoadingComponent } from '../../../../shared/components/loading.component/loading.component';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs';
import { MatriculaPipe } from '../../../../shared/pipes/matricula.pipe';

@Component({
  selector: 'app-servidor-table',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    LoadingComponent,
    MatriculaPipe
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex flex-col w-full border border-gray-300 rounded-lg drop-shadow-md overflow-hidden
             relative max-h-[calc(100vh-406px)] min-h-[505px]"
    >
      <!-- Chama o componente de loading-->
      <div
        class="absolute inset-0 z-50 bg-white/60 flex justify-center items-center backdrop-blur-sm
              transition-opacity duration-300"
        [class.opacity-0]="!isLoading()"
        [class.opacity-100]="isLoading()"
        [class.pointer-events-none]="!isLoading()">
        <app-loading [isLoading]="true" />
      </div>

      <div class="overflow-x-auto w-full flex-1 min-h-0">
        <table mat-table [dataSource]="data()" class="w-full min-w-full">
          <ng-container matColumnDef="matricula">
            <th
              mat-header-cell
              *matHeaderCellDef
              class="!font-semibold text-gray-800 !text-sm !px-3 !w-[1%] whitespace-nowrap"
            >
              Matrícula
            </th>
            <td mat-cell *matCellDef="let s"
                class="!text-sm !px-3 whitespace-nowrap">
              {{ s.matricula | matricula }}
            </td>
          </ng-container>

          <ng-container matColumnDef="nome">
            <th mat-header-cell *matHeaderCellDef
                class="!font-semibold text-gray-800 !text-sm !px-3">
              Nome
            </th>
            <td mat-cell *matCellDef="let s"
                class="!font-medium !text-sm !px-3 truncate max-w-[150px] md:max-w-none">
              {{ s.nome }}
            </td>
          </ng-container>

          <ng-container matColumnDef="email">
            <th
              mat-header-cell
              *matHeaderCellDef
              class="!font-semibold !text-gray-800 !text-sm !px-3"
            >
              Email
            </th>
            <td
              mat-cell
              *matCellDef="let s"
              class="!text-sm !px-3 text-gray-600">
              {{ s.emailPessoal }}
            </td>
          </ng-container>

          <ng-container matColumnDef="cargo">
            <th mat-header-cell *matHeaderCellDef
                class="font-semibold text-gray-800 !text-sm !px-3">
              Cargo
            </th>
            <td
              mat-cell
              *matCellDef="let s"
              class="!text-sm !px-3 text-gray-600">
              {{ s.cargo?.nome || '-' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="setor">
            <th mat-header-cell *matHeaderCellDef
                class="!font-semibold text-gray-800 !text-sm !px-3">
              Setor
            </th>
            <td
              mat-cell
              *matCellDef="let s"
              class="!text-sm !px-3 text-gray-600">
              {{ s.setor?.nome || '-' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="acoes">
            <th
              mat-header-cell
              *matHeaderCellDef
              class="!text-center !text-sm !px-3 !w-[1%] whitespace-nowrap"
            >
              Ações
            </th>
            <td mat-cell *matCellDef="let s"
                class="!text-sm !px-2 md:!px-3 text-gray-600 whitespace-nowrap text-right">

              <div class="flex items-center justify-end">
                @if (tableMode() === 'NORMAL') {
                  <button
                    mat-icon-button
                    (click)="viewDetail(s.id, 'ativo')"
                    matTooltip="Exibir detalhes"
                    class="group !w-10 !h-10 md:!w-8 md:!h-8 !leading-none mr-1
                        md:mr-2 flex justify-center items-center"
                  >
                    <mat-icon
                      class="!text-green-800 transition-transform duration-200
                            group-hover:!text-green-600 group-hover:!scale-125 !text-[20px]"
                    >
                      visibility
                    </mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    (click)="edit.emit(s)"
                    matTooltip="Editar"
                    class="group !w-10 !h-10 md:!w-8 md:!h-8 !leading-none mr-1 md:mr-2
                        flex justify-center items-center"
                  >
                    <mat-icon
                      class="!text-blue-600 transition-transform duration-200
                          group-hover:!text-blue-400 group-hover:!scale-125 !text-[20px]"
                    >
                      edit
                    </mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    (click)="delete.emit(s)"
                    matTooltip="Excluir"
                    class="group !w-10 !h-10 md:!w-8 md:!h-8 !leading-none disabled:!cursor-not-allowed
                         disabled:!pointer-events-auto flex justify-center items-center"
                  >
                    <mat-icon
                      class="!text-red-600 transition-transform duration-200 group-hover:!text-red-900
                            group-hover:!scale-125 group-disabled:!text-gray-400
                            group-disabled:!scale-100 !text-[20px]"
                    >
                      delete
                    </mat-icon>
                  </button>
                } @else {
                  <button
                    mat-icon-button
                    (click)="viewDetail(s.id, 'desligado')"
                    matTooltip="Exibir detalhes"
                    class="group !w-10 !h-10 md:!w-8 md:!h-8 !leading-none mr-1
                        md:mr-2 flex justify-center items-center"
                  >
                    <mat-icon
                      class="!text-green-800 transition-transform duration-200
                            group-hover:!text-green-600 group-hover:!scale-125 !text-[20px]"
                    >
                      visibility
                    </mat-icon>
                  </button>

                  <button
                    mat-icon-button
                    (click)="reactivate.emit(s)"
                    matTooltip="Readmitir Servidor"
                    class="group !w-10 !h-10 md:!w-8 md:!h-8 !leading-none flex justify-center
                          items-center">
                    <mat-icon
                      class="!text-teal-600 transition-transform duration-200
                            group-hover:!text-teal-400 group-hover:!scale-125 !text-[20px]">
                      settings_backup_restore
                    </mat-icon>
                  </button>
                }
              </div>
            </td>
          </ng-container>

          <tr
            mat-header-row
            *matHeaderRowDef="displayedColumns(); sticky: true"
            class="!min-h-[40px] !h-[40px] !bg-gray-50 border-b-2 border-gray-300 z-10"
          ></tr>
          <tr
            mat-row
            *matRowDef="let row; columns: displayedColumns()"
            [class]="tableMode() !== 'NORMAL'
              ? '!bg-red-100 hover:!bg-red-200 [&>td]:!text-red-800'
              : 'odd:!bg-white even:!bg-gray-50 hover:!bg-blue-50'"
            class="!min-h-[40px] !h-[40px] transition-colors cursor-pointer border-gray-100"
          ></tr>

          <tr class="mat-row" *matNoDataRow>
            <td
              class="mat-cell p-4 md:p-8 !bg-red-500 !text-center text-white text-base
                    md:text-sm md:font-semibold"
              [colSpan]="displayedColumns().length"
            >
              @if (tableMode() === 'NORMAL') {
                Nenhum Servidor com Status: {{ noDataRow() }} encontrado para os filtros informados.
              } @else {
                Nenhum Servidor com Status: EXCLUÍDO encontrado para os filtros informados.
              }
            </td>
          </tr>
        </table>
      </div>
      <mat-paginator
        class="shrink-0 border-t border-gray-200 relative z-20"
        [length]="totalElements()"
        [pageSize]="pageSize()"
        [pageIndex]="currentPage()"
        [pageSizeOptions]="[10, 15, 20]"
        [showFirstLastButtons]="true"
        (page)="pageChange.emit($event)"
        aria-label="Selecione a página"
      >
      </mat-paginator>
    </div>
  `
})
export class ServidorTableComponent {
  // injete o router no ServidorListComponent ou ServidorTableComponent
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly breakpointObserver = inject(BreakpointObserver);

  // INPUTS (Dados que vêm do Pai)
  data = input.required<ServidorResponseDTO[]>();
  totalElements = input.required<number>();
  pageSize = input.required<number>();
  currentPage = input.required<number>();
  isLoading = input.required<boolean>();

  status = input.required<number | null>();

  // NOVO: Define se a tabela é normal ou de lixeira (padrão é NORMAL)
  tableMode = input<'NORMAL' | 'EXCLUDED'>('NORMAL');
  // NOVO: Emissor de evento para o botão de readmitir
  reactivate = output<ServidorResponseDTO>();

  // OUTPUTS (Eventos que avisam o Pai)
  edit = output<ServidorResponseDTO>();
  delete = output<ServidorResponseDTO>();
  pageChange = output<PageEvent>();

  // Cria um Signal reativo que será true em telas menores que 768px
  // (equivalente ao 'md' do Tailwind)
  isMobile = toSignal(
    this.breakpointObserver.observe('(max-width: 767px)').pipe(
      map(result => result.matches)
    ),
    { initialValue: false }
  );

  // Computa as colunas a serem exibidas com base no Signal isMobile
  displayedColumns = computed(() => {
    if (this.isMobile()) {
      return ['nome', 'acoes']; // Array para Mobile
    }
    return ['matricula', 'nome', 'email', 'setor', 'cargo', 'acoes']; // Array para Desktop
  });

  // Desabilita botões se o usuário não for admin
  isButtonsDisabled = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return;
    return user.roles.find((p) => p === 'admin');
  });

  // navega para a página que exibe relatório de detalhes
  viewDetail(id: number, currentTab: 'ativo' | 'desligado') {
    this.router.navigate(['/servidores/detalhes', id], {
      queryParams: { type: currentTab }
    }).then();
  }

  // Muda a cor do texto das linhas da tabela dependendo se está
  // exibindo dados dos ATIVOS ou dos EXCLUÍDOS
  textColor = computed(() => {
    if (this.tableMode() === 'NORMAL') {
      return 'text-gray-700';
    } else {
      return 'text-red-600';
    }
  });

  // Seleciona a legenda do status na mensagem quando não há
  // registros a serem exibidos na tabela
  noDataRow = computed(() => {
    switch (this.status()) {
      case 2:
        return 'INATIVO';
      case 3:
        return 'FÉRIAS';
      case 4:
        return 'PENDENTE';
      case 5:
        return 'AFASTADO';
      case 6:
        return 'DESCONHECIDO';
      default:
        return 'ATIVO';
    }
  });
}
