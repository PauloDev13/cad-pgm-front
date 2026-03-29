import { Component, inject, OnInit, signal } from '@angular/core';
import { CustomListComponent } from '../../shared/components/custom-list.component/custom-list.component';
import { CargoResponseDTO, SaveRequest } from '../../core/models/cargo.model';
import { ToastService } from '../../core/services/toast.service';
import { CustomDeleteService } from '../../shared/service/custom-delete.service';
import { MatDialog } from '@angular/material/dialog';
import { CustomCadModalComponent } from '../../shared/components/custom-cad-modal.component/custom-cad-modal.component';
import { firstValueFrom } from 'rxjs';
// import { HttpErrorResponse } from '@angular/common/http';
import { SetorService } from '../../core/services/setor.service';
import { SetorResponseDTO } from '../../core/models/setor.model';
import { ApiErrorHandlerService } from '../../shared/service/api-error-handler.service';

@Component({
  selector: 'app-setor-display',
  imports: [CustomListComponent],
  standalone: true,
  template: `
    <app-cargo-custom-list
      title="Setor"
      [data]="setores()"
      (onAdd)="openModalNew()"
      (onEdit)="openModalEdit($event)"
      (onDelete)="delete($event)"
    />
  `,
  styles: ``,
})
export default class SetorDisplayComponent implements OnInit {
  // O estado (lista de cargos) que será passado para o componente filho
  setores = signal<CargoResponseDTO[]>([]);

  // injeção dos serviços
  private readonly setorService = inject(SetorService);
  private readonly toastService = inject(ToastService);
  private readonly errorHandlerService = inject(ApiErrorHandlerService);
  private readonly customDeleteService = inject(CustomDeleteService);
  private readonly dialog = inject(MatDialog);

  ngOnInit() {
    this.loadCargos();
  }

  // busca os registros
  loadCargos() {
    this.setorService.findAll().subscribe({
      next: (dados) => this.setores.set(dados),
      error: (err) => {
        console.error('Erro ao buscar setores', err);
        this.toastService.error('Erro ao buscar setores');
      },
    });
  }

  openModalNew() {
    this.openDialogForm();
  }

  openModalEdit(selectedCargo: CargoResponseDTO) {
    this.openDialogForm(selectedCargo);
  }

  delete(id: number) {
    this.customDeleteService.execute(
      () => this.setorService.delete(id),
      () => this.loadCargos(),
      { successMsg: 'Cargo removido com sucesso!' },
    );
  }

  // insere ou edita um registro
  async save({ id, payload }: SaveRequest) {
    try {
      // se tem id, é para Editar, se não, é para Inserir
      if (id) {
        await firstValueFrom(this.setorService.update(id, payload));
      } else {
        await firstValueFrom(this.setorService.create(payload));
      }

      this.toastService.success(`Cargo ${id ? 'atualizado' : 'cadastrado'} com sucesso!`);
      // Recarrega a tabela com os dados novos
      this.loadCargos();
    } catch (error: any) {
      this.errorHandlerService.errorHandler(error);
    }
  }

  // Método privado que centraliza a abertura do Dialog
  private openDialogForm(selectedSetor?: SetorResponseDTO) {
    const dialogRef = this.dialog.open(CustomCadModalComponent, {
      width: '500px',
      disableClose: true,
      data: {
        title: 'Setor', // Dizemos pro Dialog que ele está lidando com Cargos
        element: selectedSetor, // Passamos o cargo inteiro se for edição, ou undefined se for novo
      },
    });

    // Quando o usuário clica em Salvar lá no Dialog, ele cai aqui:
    dialogRef.afterClosed().subscribe((result) => {
      // Se tiver resultado (não cancelou), chamamos a API!
      if (result) {
        this.save(result).then();
      }
    });
  }
}
