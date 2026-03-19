import { Component, inject, OnInit, signal } from '@angular/core';
import { ServidorService } from '../../../core/services/servidor.service';
import { ServidorResponseDTO } from '../../../core/models/servidor.model';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-servidor-list',
  standalone: true,
  template: ` <div class="p-6 max-w-7xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Gestão de Servidores</h1>
        <p class="text-sm text-gray-500">Gerencie os servidores do sistema</p>
      </div>
      <button mat-flat-button color="primary" (click)="openForm()">
        <mat-icon>add</mat-icon> Novo Servidor
      </button>
    </div>

    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <table mat-table [dataSource]="servidores()" class="w-full">
        <ng-container matColumnDef="matricula">
          <th mat-header-cell *matHeaderCellDef class="font-semibold text-gray-700">Matrícula</th>
          <td mat-cell *matCellDef="let s">{{ s.matricula }}</td>
        </ng-container>

        <ng-container matColumnDef="nome">
          <th mat-header-cell *matHeaderCellDef class="font-semibold text-gray-700">Nome</th>
          <td mat-cell *matCellDef="let s" class="font-medium">{{ s.nome }}</td>
        </ng-container>

        <ng-container matColumnDef="email">
          <th mat-header-cell *matHeaderCellDef class="font-semibold text-gray-700">Email</th>
          <td mat-cell *matCellDef="let s">{{ s.emailPessoal }}</td>
        </ng-container>

        <ng-container matColumnDef="cargo">
          <th mat-header-cell *matHeaderCellDef class="font-semibold text-gray-700">Cargo</th>
          <td mat-cell *matCellDef="let s">{{ s.cargo?.nome || '-' }}</td>
        </ng-container>

        <ng-container matColumnDef="setor">
          <th mat-header-cell *matHeaderCellDef class="font-semibold text-gray-700">Setor</th>
          <td mat-cell *matCellDef="let s">{{ s.setor?.nome || '-' }}</td>
        </ng-container>

        <ng-container matColumnDef="vinculo">
          <th mat-header-cell *matHeaderCellDef class="font-semibold text-gray-700">Vínculo</th>
          <td mat-cell *matCellDef="let s">{{ s.vinculo?.nome || '-' }}</td>
        </ng-container>

        <ng-container matColumnDef="acoes">
          <th mat-header-cell *matHeaderCellDef class="text-right">Ações</th>
          <td mat-cell *matCellDef="let s" class="text-right">
            <button mat-icon-button color="primary" (click)="openForm(s)" matTooltip="Editar">
              <mat-icon>edit</mat-icon>
            </button>
            <button
              mat-icon-button
              color="warn"
              (click)="deleteServidor(s.id)"
              matTooltip="Excluir"
            >
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr
          mat-row
          *matRowDef="let row; columns: displayedColumns"
          class="hover:bg-gray-50 transition-colors"
        ></tr>

        <tr class="mat-row" *matNoDataRow>
          <td class="mat-cell p-4 text-center text-gray-500" [colSpan]="displayedColumns.length">
            {{ isLoading() ? 'Carregando servidores...' : 'Nenhum servidor encontrado.' }}
          </td>
        </tr>
      </table>

      <mat-paginator
        [length]="totalElements()"
        [pageSize]="pageSize()"
        [pageSizeOptions]="[5, 10, 25, 100]"
        (page)="onPageChange($event)"
        aria-label="Selecione a página"
      >
      </mat-paginator>
    </div>
  </div>`,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatTooltip,
  ],
})
export default class ServidorListComponent implements OnInit {
  // Injeções
  private readonly servidorService = inject(ServidorService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  //Signals para Estado
  servidores = signal<ServidorResponseDTO[]>([]);
  totalElements = signal<number>(0);
  pageSize = signal<number>(10);
  currentPage = signal<number>(0);
  isLoading = signal<boolean>(false);

  displayedColumns: string[] = ['matricula', 'nome', 'email', 'cargo', 'setor', 'vinculo', 'acoes'];

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.servidorService.listar(this.currentPage(), this.pageSize()).subscribe({
      next: (page) => {
        this.servidores.set(page.content);
        this.totalElements.set(page.totalElements);
        console.log(page.content);
      },
      error: () => this.showMessage('Erro ao carregar servidores'),
      complete: () => this.isLoading.set(false),
    });
  }

  openForm(servidor?: ServidorResponseDTO) {
    console.log(servidor);
  }

  deleteServidor(id: number) {
    console.log(id);
  }

  onPageChange(event: PageEvent) {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadData();
  }

  private showMessage(msg: string) {
    this.snackBar.open(msg, 'Fechar', { duration: 3000, horizontalPosition: 'right' });
  }
}
