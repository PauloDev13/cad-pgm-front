import { Component, input } from '@angular/core';
import { MatError, MatFormField } from '@angular/material/input';
import { FormField } from '@angular/forms/signals';
import { MatOption, MatSelect } from '@angular/material/select';
import { BaseEntityDTO } from '../../../core/models/servidor.model';
import { MatLabel } from '@angular/material/form-field';

@Component({
  selector: 'app-custom-select',
  imports: [MatError, MatFormField, FormField, MatSelect, MatOption, MatLabel],
  template: `
    <mat-form-field appearance="outline" class="w-full" floatLabel="always">
      <!--Campo status-->
      <mat-label>Status</mat-label>
      <mat-select [formField]="servidorForm().statusId" placeholder="Clique e seleciona o Status">
        @for (status of statusList(); track status.id) {
          <mat-option [value]="status.id">{{ status.descricao }}</mat-option>
        }
      </mat-select>
      @if (servidorForm().statusId.invalid() && servidorForm().statusId().touched()) {
        <mat-error>{{ servidorForm().statusId().errors()[0].message }}</mat-error>
      }
    </mat-form-field>
  `,
  styles: ``,
})
export class CustomSelectComponent {
  // Recebe a lista pronta do pai
  statusList = input.required<BaseEntityDTO[]>();
  servidorForm = input.required<any>();
}
