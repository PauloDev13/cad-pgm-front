import { Component, inject, OnInit, signal } from '@angular/core';
import { CargoRequestDTO, CargoResponseDTO } from '../../../core/models/cargo.model';
import { CargoService } from '../../../core/services/cargo.service';
import { CustomCadFormComponent } from '../../../shared/components/custom-cad-form.component/custom-cad-form.component';
import { ToastService } from '../../../core/services/toast.service';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

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
  // O estado (lista de cargos) que será passado para a tabela genérica
  cargos = signal<CargoResponseDTO[]>([]);
  private readonly cargoService = inject(CargoService);
  private readonly toastService = inject(ToastService);

  ngOnInit() {
    this.loadCargos();
  }

  loadCargos() {
    this.cargoService.findAll().subscribe({
      next: (dados) => this.cargos.set(dados),
      error: (err) => console.error('Erro ao buscar cargos', err),
    });
  }

  async save(param: { id?: number; payload: CargoRequestDTO }) {
    try {
      if (param.id) {
        await firstValueFrom(this.cargoService.update(param.id, param.payload));
      } else {
        await firstValueFrom(this.cargoService.create(param.payload));
      }

      this.toastService.success(`Cargo ${param.id ? 'atualizado' : 'cadastrado'} com sucesso!`);
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
    console.log(id);
    if (confirm('Tem certeza que deseja excluir este cargo?')) {
      this.cargoService.delete(id).subscribe({
        next: () => {
          this.toastService.success('Cargo excluído com sucesso!');
          this.loadCargos();
        },
        error: (err) => {
          // Você pode usar o mesmo tratamento de erro aqui no futuro se desejar
          this.toastService.error(`Erro ao excluir cargo. ${err.errors[0].message()}`);
        },
      });
    }
  }
}
