import { Component, inject, OnInit, signal } from '@angular/core';
import { CargoResponseDTO, SaveRequest } from '../../../core/models/cargo.model';
import { CargoService } from '../../../core/services/cargo.service';
import { CustomCadFormComponent } from '../../../shared/components/custom-cad-form.component/custom-cad-form.component';
import { ToastService } from '../../../core/services/toast.service';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { CustomDeleteService } from '../../../shared/service/custom-delete.service';

@Component({
  selector: 'app-cargo',
  imports: [CustomCadFormComponent],
  standalone: true,
  template: `
    <app-custom-cad-form
      title="Cargo"
      [data]="cargos()"
      (onSave)="save($event)"
      (onDelete)="delete($event)"
    />
  `,
  styles: ``,
})
export default class CargoComponent implements OnInit {
  // O estado (lista de cargos) que será passado para o componente filho
  cargos = signal<CargoResponseDTO[]>([]);

  // injeção dos serviços
  private readonly cargoService = inject(CargoService);
  private readonly toastService = inject(ToastService);
  private readonly customDeleteService = inject(CustomDeleteService);

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

  delete(id: number) {
    this.customDeleteService.execute(
      () => this.cargoService.delete(id),
      () => this.loadCargos(),
      { successMsg: 'Cargo removido com sucesso!' },
    );
  }
}
