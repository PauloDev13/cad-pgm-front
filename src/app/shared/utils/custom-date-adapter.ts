import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {

  // Sobrescrevemos o método que "lê" o que o usuário digita
  override parse(value: any): Date | null {
    // Se o valor for uma string e contiver barras (ex: 10/05/1991)
    if (typeof value === 'string' && value.indexOf('/') > -1) {
      const str = value.split('/');

      const day = Number(str[0]);
      const month = Number(str[1]) - 1; // O Javascript conta os meses de 0 a 11
      const year = Number(str[2]);

      // Cria a data no formato correto: Ano, Mês, Dia
      return new Date(year, month, day);
    }

    // Para outros formatos (como quando vem do próprio calendário), usa o comportamento padrão
    return super.parse(value);
  }
}
