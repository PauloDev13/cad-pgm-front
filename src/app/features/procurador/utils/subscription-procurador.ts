import { ProcuradorRequestDTO } from '../models/procurador.model';
import { maxLength, minLength, required, schema, validate } from '@angular/forms/signals';
import { DateTime } from 'luxon';

export type ProcuradorFormModel = ProcuradorRequestDTO;

export const initialDataProcurador: ProcuradorFormModel = {
  nome: '',
  tipoCertificado: 'A1',
  dataExpedicao: ''
};

export const subscriptionProcuradorSchema = schema<ProcuradorFormModel>((path) => {
  // Nome
  required(path.nome, { message: 'O nome do procurador é obrigatório' });
  minLength(path.nome, 3, { message: 'O nome deve ter no mínimo 3 caracteres' });
  maxLength(path.nome, 150, { message: 'O nome deve ter no máximo 150 caracteres' });

  // Tipo Certificado
  required(path.tipoCertificado, { message: 'O tipo de certificado é obrigatório' });

  // Data Expedição (Formato DD/MM/YYYY)
  required(path.dataExpedicao, { message: 'A data de expedição é obrigatória' });
  validate(path.dataExpedicao, ({ value }) => {
    const val = value()?.trim();
    if (!val) return null;
    if (val.length !== 10) {
      return { kind: 'incompleteDate', message: 'Informe a data completa no formato DD/MM/AAAA' };
    }
    const dt = DateTime.fromFormat(val, 'dd/MM/yyyy');
    if (!dt.isValid) {
      return { kind: 'invalidDate', message: 'Data inválida' };
    }
    return null;
  });
});

