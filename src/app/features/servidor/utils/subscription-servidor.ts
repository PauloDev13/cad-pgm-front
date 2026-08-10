import { email, maxLength, minLength, pattern, required, schema, validate } from '@angular/forms/signals';
import { FormModel } from '../component/servidor-form/servidor-form.component';
import { CustomValidators } from '../../../shared/utils/custom-validators';

export const initialDataServidor: FormModel = {
  nome: '',
  matricula: '',
  cpf: '',
  dataNascimento: '',
  genero: '',
  telefone: '',
  emailPessoal: '',
  emailInstitucional: '',
  endereco: '',
  filiacao: '',
  tipoAtividade: 'PRESENCIAL',
  cargoId: null,
  setorId: null,
  lotacaoId: 1,
  statusId: 4,
  vinculoId: null,

  procuradorIds: [],
  aliasIds: [],
  sistemaIds: []
};

export const subscriptionSchema = schema<FormModel>((path) => {
  // validações para o campo Nome
  required(path.nome, { message: 'O nome é obrigatório' });
  minLength(path.nome, 5, { message: 'O Nome deve ter no mínimo 5 caracteres' });
  maxLength(path.nome, 150, {
    message: 'O nome deve ter no máximo 150 caracteres'
  });

  // validações para o campo Matrícula
  required(path.matricula, { message: 'É obrigatório' });
  maxLength(path.matricula, 20, {
    message: 'A matrícula deve ter no máximo 20 caracteres'
  });

  // validações para o campo CPF
  required(path.cpf, { message: 'O CPF é obrigatório' });
  pattern(path.cpf, /^\d{11}$/, { message: 'O CPF deve ter 11 dígitos' });
  validate(path.cpf, ({ value }) => CustomValidators.cpfValidator(value()));

  // validações para o campo Data de Nascimento
  required(path.dataNascimento, { message: 'A data é obrigatório' });
  validate(path.dataNascimento, ({ value }) =>
    CustomValidators.validDateText(value()));
  validate(path.dataNascimento, ({ value }) =>
    CustomValidators.minimumAge(value(), 16));

  // validações para o campo Telefone
  maxLength(path.telefone, 20, {
    message: 'O telefone deve ter no máximo 20 dígitos'
  });

  // validações para o campo Email Pessoal
  required(path.emailPessoal, { message: 'O Email é obrigatório' });
  email(path.emailPessoal, { message: 'E-mail inválido' });
  maxLength(path.emailPessoal, 100, {
    message: 'O Email deve ter no máximo 100 caracteres'
  });

  // validações para o campo Email Institucional
  maxLength(path.emailInstitucional, 100, {
    message: 'O Email deve ter no máximo 100 caracteres'
  });
  email(path.emailInstitucional, { message: 'E-mail inválido' });

  // validações para os campos de relacionamentos
  required(path.cargoId, { message: 'O Cargo é obrigatório' });
  required(path.setorId, { message: 'O Setor é obrigatório' });
  required(path.lotacaoId, { message: 'A Lotação é obrigatório' });
  required(path.statusId, { message: 'O Status é obrigatório' });
  required(path.vinculoId, { message: 'O vinculo é obrigatório' });
});
