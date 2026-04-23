import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageResponse } from '../../../shared/model/pagination.model';
// import { CustomDeleteService } from '../../../shared/service/custom-delete.service';
import { debounceTime, distinctUntilChanged, finalize, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IUsuarioResponse } from '../models/usuario.model';
import { UsuarioService } from '../services/usuario.service';
import { UsuarioTableComponent } from '../components/usuario-table.component/usuario-table.component';
import { UsuarioFilterComponent } from '../components/usuario-filter.component/usuario-filter.component';
import { UsuarioFormComponent } from '../components/usuario-form.component/usuario-form.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AuthService } from '../../../core/auth/services/auth.service';
import {
  TemporaryPasswordDialogComponent
} from '../../../core/auth/component/temporary -password-dialog/temporary-password-dialog.component';
import { NotificationService } from '../../../shared/service/NotificationSnackbar.service';
import { CustomDeleteService } from '../../../shared/service/custom-delete.service';

@Component({
  selector: 'app-servidor-list',
  standalone: true,
  template: `
    <div
      class="bg-gray-50 shadow rounded-2xl border border-gray-200 p-4 md:p-6 max-w-7xl mx-auto mt-4"
    >
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-blue-800">Gestão de Usuários</h1>
          <p class="text-sm text-gray-500">Gerencie os usuários do sistema</p>
        </div>
        <button
          mat-flat-button
          class="!bg-blue-600 hover:!bg-blue-600
          !transition-transform
          !duration-300
          !ease-in-out
          hover:!scale-105"
          (click)="openForm()"
        >
          <mat-icon class="!scale-105 right-1">add</mat-icon>
          Novo
        </button>
      </div>

      <!-- Chama o componente de pesquisa-->
      <app-usuario-filter
        [searchType]="searchType()"
        [searchTerm]="searchTerm()"
        (statusChange)="onStatusChange($event)"
        (searchTypeChange)="onSearchTypeChange($event)"
        (searchInput)="onSearchInput($event)"
      />

      <!-- Chama o componente que tem a tabela para listar usuários-->
      <app-usuario-table
        [data]="usuarios()"
        [isLoading]="isLoading()"
        [totalElements]="totalElements()"
        [pageSize]="pageSize()"
        [currentPage]="currentPage()"
        (edit)="openForm($event)"
        (confirmResetPassword)="onResetPassword($event)"
        (delete)="delete($event)"
        (pageChange)="onPageChange($event)"
      />
    </div>
  `,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    UsuarioTableComponent,
    UsuarioFilterComponent
  ]
})
export default class UsuarioListPage implements OnInit {
  // Injeções de dependências
  private readonly usuarioService = inject(UsuarioService);
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);
  private readonly customDeleteService = inject(CustomDeleteService);
  private readonly dialog = inject(MatDialog);

  //Signals para Estado
  usuarios = signal<IUsuarioResponse[]>([]);
  totalElements = signal<number>(0);
  pageSize = signal<number>(10);
  currentPage = signal<number>(0);
  isLoading = signal<boolean>(false);

  // Estado do formulário de busca no HTML
  selectedNameId = signal<number | null>(null);
  searchType = signal<'NOME' | 'LOGIN' | 'EMAIL'>('NOME');
  searchTerm = signal<string>('');

  //O funil de eventos de digitação
  private searchSubject = new Subject<string>();
  // O Angular nos dá uma referência da destruição deste componente
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.loadData();
    this.configurarDebounceDePesquisa(); // Inicializa o nosso escutador
  }

  // centralizador: Decide qual endpoint chamar com base nos filtros
  loadData() {
    this.isLoading.set(true);

    const page = this.currentPage();
    const size = this.pageSize();

    const termo = this.searchTerm();
    const tipo = this.searchType();

    // Mapeia o termo de pesquisa para o parâmetro correto
    const name = tipo === 'NOME' && termo ? termo : undefined;
    const userName = tipo === 'LOGIN' && termo ? termo : undefined;
    const email = tipo === 'EMAIL' && termo ? termo : undefined;

    // Chama o NOVO ENDPOINT no Service (searchFilter)
    this.usuarioService
      .searchFilter(page, size, name, userName, email)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (pageData) => {
          this.setPageData(pageData);
        },
        error: (err: Error) => {
          console.error(err.message);
          this.notificationService.error(err.message, 'Pesquisa');

        }
      });
  }

  // abre o modal com o formulário de cadastro de usuário
  openForm(usuario?: IUsuarioResponse) {
    const dialogRef = this.dialog.open(UsuarioFormComponent, {
      width: '700px',
      height: '350px',
      maxWidth: '95vw',
      maxHeight: '90vw',
      data: usuario,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {

      if (result) {
        this.loadData(); // Recarrega se houve alteração
      }
    });
  }

  // abre o modal com as informações para gerar senha temporária
  onResetPassword(usuario?: IUsuarioResponse) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Senha',
        message: `Gerar nova senha para ${usuario?.name.toUpperCase()}?`
      }
    });
    dialogRef.afterClosed().subscribe((confirm) => {
      if (confirm) {
        this.authService.resetPasswordByAdmin(usuario?.id).subscribe({
          next: (response) => {
            this.dialog.open(TemporaryPasswordDialogComponent, {
              data: {
                title: 'Senha',
                message: `
                  Copie e informe esta senha ao usuário.
                  Ele será obrigado a trocá-la no próximo login
                `,
                password: response.temporaryPassword
              },
              disableClose: true
            });
          },
          error: (err: Error) => {
            this.notificationService.error(err.message, 'Senha');
            console.error(err.message);
          }
        });
      }
    });
  }

  delete(payload: IUsuarioResponse) {
    this.customDeleteService.execute(
      () => this.usuarioService.delete(payload),
      () => this.loadData(),
      {
        title: 'Usuário',
        message: `Esta ação não poderá ser desfeita.
                  Excluir o perfil de: <strong class="text-red-600">${payload.name.toUpperCase()}</strong>?`,
        successMsg: `Perfil de: <strong>${payload.name.toUpperCase()}</strong> foi removido`
      }
    );
  }

  // controla a paginação
  onPageChange(event: PageEvent) {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadData();
  }

  // É o chamado pelo HTML quando o usuário troca o Status
  onStatusChange(id: number | null) {
    this.selectedNameId.set(id);
    // Limpa o input de texto (CPF/Matrícula)
    this.searchTerm.set('');
    this.currentPage.set(0); // Reseta para a primeira página
    this.loadData(); //Dispara a busca limpa no backend
  }

  // É chamado pelo HTML quando o usuário digita no campo de busca
  // ALTERAÇÃO: O HTML não atualiza mais o Signal direto, ele alimenta o Subject
  onSearchInput(event: Event) {
    let value = (event.target as HTMLInputElement).value;
    // Joga o valor digitado no "funil" do RxJS.
    // O subscribe ali em cima vai decidir quando disparar a busca.
    this.searchSubject.next(value);
  }

  // É chamado quando o usuário troca entre Nome, CPF ou Matrícula
  onSearchTypeChange(newType: 'NOME' | 'LOGIN' | 'EMAIL') {
    this.searchType.set(newType);
    this.searchTerm.set(''); // Limpa a memória oficial

    // Esvazia o "funil" do RxJS para garantir que nenhuma busca fantasma aconteça
    this.searchSubject.next('');

    this.currentPage.set(0); // Volta para página 1
    this.loadData(); //Recarrega a tabela mostrando todos os registros novamente!
  }

  //  NOVO MÉTHOD PARA BUSCA DINÂMICA
  private configurarDebounceDePesquisa() {
    this.searchSubject
      .pipe(
        debounceTime(500), // Espera o usuário parar de digitar por 500ms
        distinctUntilChanged(), // Só continua se a palavra final for diferente da última busca
        takeUntilDestroyed(this.destroyRef) // Dizemos pro fluxo morrer com o componente
      )
      .subscribe((termoDigitado) => {
        // Se o usuário apagou tudo (Cenário 1)
        if (termoDigitado.trim() === '') {
          // this.selectedNameId.set(null); // Volta para "Todos os Status"
          this.searchTerm.set(''); // Limpa o termo no Signal
          this.currentPage.set(0); // Volta para página 1
          this.loadData(); // Recarrega a tabela completa!
          return;
        }

        //  Só busca se tiver 3 caracteres ou mais (Cenário 2)
        if (termoDigitado.trim().length >= 3) {
          this.searchTerm.set(termoDigitado.trim());
          this.currentPage.set(0);
          this.loadData();
        }
      });
  }

  // Helper para centralizar a atualização dos signals da tabela
  private setPageData(response: PageResponse<any>) {
    this.usuarios.set(response.content);
    this.totalElements.set(response.page.totalElements);
    this.currentPage.set(response.page.number);
  }
}
