import { Component, inject, OnInit, signal } from '@angular/core';
import { CargoCustomListComponent } from './list/cargo-custom-list.component';
import { CargoResponseDTO, SaveRequest } from '../../core/models/cargo.model';
import { CargoService } from '../../core/services/cargo.service';
import { ToastService } from '../../core/services/toast.service';
import { CustomDeleteService } from '../../shared/service/custom-delete.service';
import { MatDialog } from '@angular/material/dialog';
import { CustomCadModalComponent } from '../../shared/components/custom-cad-modal.component/custom-cad-modal.component';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-cargo-display',
  imports: [CargoCustomListComponent],
  standalone: true,
  template: `
    <app-cargo-custom-list
      title="Cargo"
      [data]="cargos()"
      (onAdd)="openModalNew()"
      (onEdit)="openModalEdit($event)"
      (onDelete)="delete($event)"
    />
  `,
  styles: ``,
})
export default class CargoDisplayComponent implements OnInit {
  // O estado (lista de cargos) que será passado para o componente filho
  cargos = signal<CargoResponseDTO[]>([]);

  // injeção dos serviços
  private readonly cargoService = inject(CargoService);
  private readonly toastService = inject(ToastService);
  private readonly customDeleteService = inject(CustomDeleteService);
  private readonly dialog = inject(MatDialog);

  ngOnInit() {
    this.loadCargos();
  }

  // busca os registros
  loadCargos() {
    this.cargoService.findAll().subscribe({
      next: (dados) => this.cargos.set(dados),
      error: (err) => {
        console.error('Erro ao buscar cargos', err);
        this.toastService.error('Erro ao buscar cargos');
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
      () => this.cargoService.delete(id),
      () => this.loadCargos(),
      { successMsg: 'Cargo removido com sucesso!' },
    );
  }

  // insere ou edita um registro
  async save({ id, payload }: SaveRequest) {
    try {
      // se tem id, é para Editar, se não, é para Inserir
      if (id) {
        await firstValueFrom(this.cargoService.update(id, payload));
      } else {
        await firstValueFrom(this.cargoService.create(payload));
      }

      this.toastService.success(`Cargo ${id ? 'atualizado' : 'cadastrado'} com sucesso!`);
      // Recarrega a tabela com os dados novos
      this.loadCargos();
    } catch (error: any) {
      // O seu excelente bloco de tratamento de erro do Spring
      let messageDefaultErro = 'Erro inesperado ao conectar a API';

      if (error instanceof HttpErrorResponse) {
        if (error.error && typeof error.error.message === 'string') {
          messageDefaultErro = error.error.message;
        } else if (error.error && Array.isArray(error.error.errors)) {
          messageDefaultErro =
            error.error.errors[0].defaultMessage || 'Erro de validação nos dados enviados.';
        }
      }

      this.toastService.error(messageDefaultErro);
    }
  }

  // Método privado que centraliza a abertura do Dialog
  private openDialogForm(selectedCargo?: CargoResponseDTO) {
    const dialogRef = this.dialog.open(CustomCadModalComponent, {
      width: '500px',
      disableClose: true,
      data: {
        title: 'Cargo', // Dizemos pro Dialog que ele está lidando com Cargos
        element: selectedCargo, // Passamos o cargo inteiro se for edição, ou undefined se for novo
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
