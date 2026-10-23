import { IUsuarioRequest } from '../models/usuario.model';
import { maxLength, minLength, required, schema } from '@angular/forms/signals';

export const initialDataUsuario: IUsuarioRequest = {
  servidorId: null,
  name: '',
  userName: '',
  email: '',
  password: '',
  activated: true,
  permissions: ['guest'],
  forcePasswordChange: false
};

// export const subscriptionSchema = schema<TUsuarioUpdate>((path) => {
export const subscriptionSchema = schema<IUsuarioRequest>((path) => {
  // Login
  required(path.userName, { message: 'login é obrigatório' });
  minLength(path.userName, 5, { message: 'O Login deve ter no mínimo 5 caracteres' });
  maxLength(path.userName, 30, { message: 'O Login deve ter no máximo 30 caracteres' });
});
