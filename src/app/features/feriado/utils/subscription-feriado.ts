import { FeriadoRequestDTO } from '../models/feriado.model';
import { maxLength, minLength, required, schema, validate } from '@angular/forms/signals';

export type FeriadoFormModel = FeriadoRequestDTO;

export const initialDataFeriado: FeriadoFormModel = {
  data: '',
  nome: '',
  tipo: 'FERIADO_NACIONAL',
  ativo: true
};

export const subscriptionFeriadoSchema = schema<FeriadoFormModel>((path) => {
  // Nome
  required(path.nome, { message: 'A descrição/nome do feriado é obrigatória' });
  minLength(path.nome, 3, { message: 'O nome deve ter no mínimo 3 caracteres' });
  maxLength(path.nome, 150, { message: 'O nome deve ter no máximo 150 caracteres' });

  // Tipo
  required(path.tipo, { message: 'O tipo do feriado é obrigatório' });

  // Data no formato MM-dd ou DD/MM (validação de dia e mês)
  required(path.data, { message: 'A data do feriado é obrigatória' });
  validate(path.data, ({ value }) => {
    const val = value()?.trim();

    if (!val) return null;
    // Aceita tanto MM-dd quanto dd/MM
    const regex = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$|^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])$/;

    if (!regex.test(val)) {
      return { kind: 'invalidFormat', message: 'Data inválida. Use o formato Dia/Mês (ex: 21/04)' };
    }
    return null;
  });
});
