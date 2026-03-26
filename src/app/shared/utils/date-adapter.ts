import { NativeDateAdapter } from '@angular/material/core';
import { Injectable } from '@angular/core';

// A Ponte de Comunicação
export const DateValidationState = { isInvalid: false };

@Injectable()
export class PtBrDateAdapter extends NativeDateAdapter {
  // Sobrescrevemos o method que "lê" a digitação do usuário
  override parse(value: any): Date | null {
    // 1. Reseta o alarme a cada nova digitação
    DateValidationState.isInvalid = false;

    // Se o usuário digitou uma string com barras (ex: 25/12/2024)
    if (typeof value === 'string' && value.indexOf('/') > -1) {
      const parts = value.split('/');

      const dia = parseInt(parts[0], 10);
      const mes = parseInt(parts[1], 10) - 1; // No JavaScript, Janeiro é 0, Fev é 1...

      // O ano pode vir com 2 ou 4 dígitos, vamos garantir que seja 4
      let ano = parseInt(parts[2], 10);
      if (parts[2].length === 2) {
        ano += 2000; // Se digitar "24", vira "2024"
      }

      // Validação básica para evitar que ele tente instanciar uma data maluca
      if (ano > 0 && mes >= 0 && mes <= 11 && dia > 0 && dia <= 31) {
        const dateTest = new Date(ano, mes, dia);

        // Verifica se o JS não fez o "Rollover" (empurrou a data para frente)
        if (
          dateTest.getFullYear() === ano &&
          dateTest.getMonth() === mes &&
          dateTest.getDate() === dia
        ) {
          return dateTest; // Se os números baterem, a data é real!
        } else {
          // ✨ 2. Se chegou aqui, a data é falha (ex: 32/02). Toca o alarme!
          DateValidationState.isInvalid = true;
          return new Date(NaN); // Se o JS alterou os dias, força um "Invalid Date"
        }
      }
      // ✨ 2. Se chegou aqui, a data é falha (ex: 32/02). Toca o alarme!
      DateValidationState.isInvalid = true;
      return new Date(NaN); // Se digitou mês 13, dia 40, etc... "Invalid Date"
    }

    // Se não for uma string com barra, deixa o Angular fazer o trabalho normal dele
    return super.parse(value);
  }
}
