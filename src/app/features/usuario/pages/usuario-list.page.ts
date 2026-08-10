import { ChangeDetectionStrategy, Component, inject, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IUsuarioResponse, TUsuarioDelete } from '../models/usuario.model';
import { UsuarioTableComponent } from '../components/usuario-table/usuario-table.component';
import { UsuarioFilterComponent } from '../components/usuario-filter/usuario-filter.component';
import { UsuarioFormComponent } from '../components/usuario-form/usuario-form.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import {
  TemporaryPasswordDialogComponent
} from '../../../core/auth/component/temporary -password-dialog/temporary-password-dialog.component';
import { CustomDeleteService } from '../../../shared/service/custom-delete.service';
import { UsersStore } from '../store/user.store';
import { AuthStore } from '../../../core/auth/store/auth.store';

@Component({
  selector: 'app-servidor-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="bg-gray-50 rounded-2xl p-4 md:p-6 mx-auto max-w-7xl mt-0 w-full"
    >
      <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
        <div>
          <h1 class="text-xl md:text-2xl font-bold text-blue-800 leading-tight">
            Gestão de Usuários
          </h1>
          <p class="text-sm text-gray-500 mt-1">Gerencie os usuários do sistema</p>
        </div>
        <button
          mat-flat-button
          class="!bg-blue-600 !text-white w-full sm:w-auto !transition-transform !duration-300
                 !ease-in-out hover:!scale-105 flex justify-center items-center !h-12 sm:!h-10"
          (click)="openForm()"
        >
          <mat-icon class="mr-1">add</mat-icon>
          Novo
        </button>
      </div>

      <!-- Chama o componente de pesquisa-->
      <app-usuario-filter
        [searchType]="usersStore.searchType()"
        [searchTerm]="usersStore.searchTerm()"
        (searchTypeChange)="usersStore.updateSearchType($event)"
        (searchInput)="onSearchInput($event)"
      />

      <!-- Chama o componente que tem a tabela para listar usuários-->
      <app-usuario-table
        [data]="usersStore.usuarios()"
        [isLoading]="usersStore.isLoading()"
        [totalElements]="usersStore.totalElements()"
        [pageSize]="usersStore.pageSize()"
        [currentPage]="usersStore.currentPage()"
        (edit)="openForm($event)"
        (confirmResetPassword)="onResetPassword($event)"
        (deleteUser)="deleteUser($event)"
        (pageChange)="onPageChangeStore($event)"
      />
    </div>
  `,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    UsuarioTableComponent,
    UsuarioFilterComponent
  ],
  providers: [UsersStore]
})
export default class UsuarioListPage {
  // Injeções de dependências
  protected readonly usersStore = inject(UsersStore);
  protected readonly authStore = inject(AuthStore);
  private readonly injector = inject(Injector);
  private readonly customDeleteService = inject(CustomDeleteService);
  private readonly dialog = inject(MatDialog);


  // abre o modal com o formulário de cadastro de usuário
  openForm(usuario?: IUsuarioResponse) {
    const dialogRef = this.dialog.open(UsuarioFormComponent, {
      width: '700px',
      height: '400px',
      maxWidth: '95vw',
      maxHeight: '92vh',
      data: usuario,
      disableClose: true,
      injector: this.injector // Injeta uma a mesma instância do provider do pai para o filho
    });

    dialogRef.afterClosed().subscribe((payload) => {
      if (!payload) return;

      const isEdit = !!payload.id;
      // Se for edição, atualiza
      if (isEdit) {
        this.usersStore.updateLocalUser(payload);
      } else {
        // Se não, faz o reload para atualizar após uma inserção
        this.usersStore.reloadList();
      }
    });
  }

  // abre o modal com as informações para gerar senha temporária
  onResetPassword(usuario?: IUsuarioResponse) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Senha',
        message: `Gerar nova senha para ${usuario?.name.toUpperCase()}?`
      },
      injector: this.injector // Injeta uma a mesma instância do provider do pai para o filho
    });
    dialogRef.afterClosed().subscribe((confirm) => {
      if (confirm) {
        this.authStore.resetPasswordByAdmin({
          userId: usuario?.id,
          onSuccess: (temporaryPassword: string) => {
            this.dialog.open(TemporaryPasswordDialogComponent, {
              data: {
                title: 'Senha',
                message: `
                  Copie e informe esta senha ao usuário.
                  Ele será obrigado a trocá-la no próximo login
                `,
                password: temporaryPassword
              },
              disableClose: true
            });
          }
        });
      }
    });
  }

  async deleteUser(payload: TUsuarioDelete) {
    const confirmed = await this.customDeleteService.confirm({
      title: 'Usuário',
      message: `Esta ação não poderá ser desfeita.<br>Excluir o perfil de:
                <strong class="text-red-600">${payload.name.toUpperCase()}</strong>?`
    });

    if (confirmed) {
      this.usersStore.deleteUser({
        payload,
        onSuccess: () => {
          this.customDeleteService.showSuccessNotification(
            `Perfil de: <strong>${payload.name.toUpperCase()}</strong> foi removido`
          );
          this.usersStore.reloadList();
        }
      });
    }
  }

  onPageChangeStore(event: any) {
    this.usersStore.updatePagination(event.pageIndex, event.pageSize);
  }

  // É chamado pelo HTML quando o usuário digita no campo de busca
  // ALTERAÇÃO: O HTML não atualiza mais o Signal direto, ele alimenta o Subject
  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    // Jogamos o valor diretamente no método reativo da Store!
    // A Store vai esperar os 500ms e checar as regras antes de buscar.
    this.usersStore.updateSearchTermDebounced(value);
  }
}
