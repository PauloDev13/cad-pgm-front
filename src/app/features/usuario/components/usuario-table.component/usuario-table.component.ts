import { Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UsuarioResponse } from '../../../../shared/model/auth-login.model';
// import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { LoadingComponent } from '../../../../shared/components/loading.component/loading.component';

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
    LoadingComponent,
  ],
  standalone: true,
  template: ` <div
    class="border border-gray-300 rounded-lg drop-shadow-md overflow-hidden relative"
  >
    <!-- Chama o componente de loading-->
    <app-loading [isLoading]="isLoading()" />

    <table mat-table [dataSource]="data()" class="w-full">
      <ng-container matColumnDef="ID">
        <th
          mat-header-cell
          *matHeaderCellDef
          class="!font-semibold text-gray-800 !text-sm !px-3 !w-[1%] whitespace-nowrap"
        >
          ID
        </th>
        <td mat-cell *matCellDef="let u" class="!text-sm !px-3 whitespace-nowrap text-gray-600">
          {{ u.id }}
        </td>
      </ng-container>

      <ng-container matColumnDef="nome">
        <th mat-header-cell *matHeaderCellDef class="!font-semibold text-gray-800 !text-sm !px-3">
          Nome
        </th>
        <td mat-cell *matCellDef="let u" class="!font-medium !text-sm !px-3 text-gray-600">
          {{ u.name }}
        </td>
      </ng-container>

      <ng-container matColumnDef="email">
        <th mat-header-cell *matHeaderCellDef class="!font-semibold !text-gray-800 !text-sm !px-3">
          E-mail
        </th>
        <td mat-cell *matCellDef="let u" class="!text-sm !px-3 text-gray-600">
          {{ u.email }}
        </td>
      </ng-container>

      <ng-container matColumnDef="login">
        <th mat-header-cell *matHeaderCellDef class="font-semibold text-gray-800 !text-sm !px-3">
          Login
        </th>
        <td mat-cell *matCellDef="let u" class="!text-sm !px-3 text-gray-600">
          {{ u.userName || '-' }}
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
        <td mat-cell *matCellDef="let u" class="!text-sm !px-3 text-gray-600 whitespace-nowrap">
          <button
            mat-icon-button
            matTooltip="Exibir detalhes"
            class="group !w-8 !h-8 !leading-none mr-2"
          >
            <mat-icon
              class="!text-gray-600 transition-transform duration-200
                group-hover:!text-gray-900 group-hover:!scale-125 !text-[20px]"
            >
              visibility
            </mat-icon>
          </button>
          <button mat-icon-button matTooltip="Editar" class="group !w-8 !h-8 !leading-none mr-2">
            <mat-icon
              class="!text-blue-600 transition-transform duration-200
                group-hover:!text-blue-900 group-hover:!scale-125 !text-[20px]"
            >
              edit
            </mat-icon>
          </button>
          <button
            [disabled]="!isButtonsDisabled()"
            mat-icon-button
            matTooltip="Excluir"
            class="group !w-8 !h-8 !leading-none"
          >
            <mat-icon
              class="!text-red-600 transition-transform duration-200
                group-hover:!text-red-900 group-hover:!scale-125 !text-[20px]"
            >
              delete
            </mat-icon>
          </button>
        </td>
      </ng-container>

      <tr
        mat-header-row
        *matHeaderRowDef="displayedColumns"
        class="!min-h-[40px] !h-[40px] !bg-gray-50 border-b-2 border-gray-300"
      ></tr>
      <tr
        mat-row
        *matRowDef="let row; columns: displayedColumns"
        class="!min-h-[40px] !h-[40px] odd:!bg-white even:!bg-gray-50 hover:!bg-blue-50
              transition-colors cursor-pointer border-gray-100"
      ></tr>

      <tr class="mat-row" *matNoDataRow>
        <td
          class="mat-cell p-4 text-center text-red-800 text-xl"
          [colSpan]="displayedColumns.length"
        >
          Nenhum Usuário encontrado.
        </td>
      </tr>
    </table>

    <mat-paginator
      [length]="totalElements()"
      [pageSize]="pageSize()"
      [pageIndex]="currentPage()"
      [pageSizeOptions]="[10, 15, 20]"
      (page)="pageChange.emit($event)"
      aria-label="Selecione a página"
    >
    </mat-paginator>
  </div>`,
  styles: ``,
})
export class UsuarioTableComponent {
  // INPUTS (Dados que vêm do Pai)
  data = input.required<UsuarioResponse[]>();
  isLoading = input.required<boolean>();
  totalElements = input.required<number>();
  pageSize = input.required<number>();
  currentPage = input.required<number>();
  // OUTPUTS (Eventos que avisam o Pai)
  edit = output<UsuarioResponse>();
  delete = output<number>();
  pageChange = output<PageEvent>();
  // Estado interno (Só pertence à tabela, o Pai não precisa saber disso)
  displayedColumns: string[] = ['ID', 'nome', 'login', 'email', 'acoes'];
  // injete o router no ServidorListComponent ou ServidorTableComponent
  // private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  isButtonsDisabled = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return;
    return user.roles.find((p) => p === 'admin');
  });

  // visualizarServidor(id: number) {
  //   this.router.navigate(['/servidores/detalhes', id]).then();
  // }
}
