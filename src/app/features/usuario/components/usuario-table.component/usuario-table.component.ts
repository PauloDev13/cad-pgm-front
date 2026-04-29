import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { LoadingComponent } from '../../../../shared/components/loading.component/loading.component';
import { IUsuarioResponse } from '../../models/usuario.model';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-usuario-table',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    LoadingComponent
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="border border-gray-300 rounded-lg drop-shadow-md overflow-hidden
      relative flex flex-col w-full">
      <!-- Chama o componente de loading-->
      <app-loading [isLoading]="isLoading()" />

      <div class="overflow-x-auto w-full">
        <table mat-table [dataSource]="data()" class="w-full min-w-full">
          <ng-container matColumnDef="ID">
            <th
              mat-header-cell
              *matHeaderCellDef
              class="!font-semibold text-gray-800 !text-sm !px-3 !w-[1%] whitespace-nowrap"
            >
              ID
            </th>
            <td mat-cell *matCellDef="let u"
                class="!text-sm !px-3 whitespace-nowrap text-gray-600">
              {{ u.id }}
            </td>
          </ng-container>

          <ng-container matColumnDef="nome">
            <th mat-header-cell *matHeaderCellDef
                class="!font-semibold text-gray-800 !text-sm !px-3">
              Nome
            </th>
            <td mat-cell *matCellDef="let u"
                class="!font-medium !text-sm !px-3 text-gray-600
                        truncate max-w-[150px] md:max-w-none">
              {{ u.name }}
            </td>
          </ng-container>

          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef
                class="!font-semibold !text-gray-800 !text-sm !px-3">
              E-mail
            </th>
            <td mat-cell *matCellDef="let u"
                class="!text-sm !px-3 text-gray-600">
              {{ u.email }}
            </td>
          </ng-container>

          <ng-container matColumnDef="login">
            <th mat-header-cell *matHeaderCellDef
                class="font-semibold text-gray-800 !text-sm !px-3">
              Login
            </th>
            <td mat-cell *matCellDef="let u" class="!text-sm !px-3 text-gray-600">
              {{ u.userName }}
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
            <td mat-cell *matCellDef="let u"
                class="!text-sm !px-2 md:!px-3 text-gray-600 whitespace-nowrap text-right">

              @if (!isMobile()) {
                <button
                  [disabled]="isActionDisabled(u)"
                  mat-icon-button
                  matTooltip="Gerar senha temporária"
                  class="group !w-8 !h-8 !leading-none mr-2 disabled:!cursor-not-allowed
                     disabled:!pointer-events-auto"
                  (click)="confirmResetPassword.emit(u)"
                >
                  <mat-icon
                    class="!text-gray-600 transition-transform duration-200
                       group-hover:!text-gray-900 group-hover:!scale-125
                       group-disabled:!scale-100
                       !text-[20px] group-disabled:!text-gray-500"
                  >
                    lock_reset
                  </mat-icon>
                </button>
              }
              <button
                [disabled]="isActionDisabled(u)"
                (click)="edit.emit(u)"
                mat-icon-button
                matTooltip="Editar"
                class="group !w-8 !h-8 !leading-none mr-2 disabled:!cursor-not-allowed
                     disabled:!pointer-events-auto"
              >
                <mat-icon
                  class="!text-blue-600 transition-transform duration-200
                       group-hover:!text-blue-900 group-hover:!scale-125
                       group-disabled:!scale-100
                       !text-[20px] group-disabled:!text-gray-500"
                >
                  edit
                </mat-icon>
              </button>
              <button
                [disabled]="isActionDisabled(u)"
                mat-icon-button
                matTooltip="Excluir"
                class="group !w-8 !h-8 !leading-none disabled:!cursor-not-allowed
                     disabled:!pointer-events-auto"
                (click)="delete.emit(u)"
              >
                <mat-icon
                  class="!text-red-600 transition-transform duration-200
                        group-hover:!text-red-900 group-hover:!scale-125
                        group-disabled:!scale-100
                        !text-[20px] group-disabled:!text-gray-500"
                >
                  delete
                </mat-icon>
              </button>
            </td>
          </ng-container>

          <tr
            mat-header-row
            *matHeaderRowDef="displayedColumns()"
            class="!min-h-[40px] !h-[40px] !bg-gray-50 border-b-2 border-gray-300"
          ></tr>
          <tr
            mat-row
            *matRowDef="let row; columns: displayedColumns()"
            class="!min-h-[40px] !h-[40px] odd:!bg-white even:!bg-gray-50 hover:!bg-blue-50
              transition-colors cursor-pointer border-gray-100"
          ></tr>

          <tr class="mat-row" *matNoDataRow>
            <td
              class="mat-cell p-4 text-center text-red-800 text-base md:text-xl"
              [colSpan]="displayedColumns().length"
            >
              Nenhum Usuário encontrado.
            </td>
          </tr>
        </table>
      </div>
      <mat-paginator
        [length]="totalElements()"
        [pageSize]="pageSize()"
        [pageIndex]="currentPage()"
        [pageSizeOptions]="[10, 15, 20]"
        [showFirstLastButtons]="true"
        (page)="pageChange.emit($event)"
        aria-label="Selecione a página"
      >
      </mat-paginator>
    </div>`
})
export class UsuarioTableComponent {
  private readonly authService = inject(AuthService);
  private readonly breakpointObserver = inject(BreakpointObserver);

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
    return ['ID', 'nome', 'email', 'login', 'acoes']; // Array para Desktop
  });

  // INPUTS (Dados que vêm do Pai)
  data = input.required<IUsuarioResponse[]>();
  isLoading = input.required<boolean>();
  totalElements = input.required<number>();
  pageSize = input.required<number>();
  currentPage = input.required<number>();

  // OUTPUTS (Eventos que avisam o Pai)
  edit = output<IUsuarioResponse>();
  confirmResetPassword = output<IUsuarioResponse>();
  delete = output<IUsuarioResponse>();
  pageChange = output<PageEvent>();

  // Avalia linha por linha se os botões devem estar desabilitados
  isActionDisabled(rowUser: IUsuarioResponse): boolean {
    const loggedUser = this.authService.currentUser();

    // Fail-safe: Se não houver usuário logado no storage, bloqueia tudo.
    if (!loggedUser) return true;

    // REGRA DE OURO (Proteção do Procurador Geral):
    // Se a linha desenhada for do 'procurador.geral' E o usuário logado NÃO for ele mesmo, bloqueia!
    if (rowUser.userName === 'pgmnet' && loggedUser.userName !== 'pgmnet') {
      return true;
    }

    // REGRA ORIGINAL (Proteção de Papel):
    // Se passou da regra acima, avalia se o usuário logado é 'admin'
    const isAdmin = loggedUser.roles.includes('admin');

    // Se NÃO for admin, retorna true (desabilita).
    return !isAdmin;
  }

  // visualizarServidor(id: number) {
  //   this.router.navigate(['/servidores/detalhes', id]).then();
  // }
}
