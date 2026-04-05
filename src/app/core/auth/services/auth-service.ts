import { Injectable, signal } from '@angular/core';
import { IFormLoginModel, IUser, MOCK_USERS } from '../models/auth.model';
import { delay, Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // O ESTADO GLOBAL: Qualquer componente pode ler isso para saber se há alguém logado
  currentUser = signal<IUser | null>(null);

  // Método de Login simulando uma requisição HTTP
  login({ userName, password }: IFormLoginModel): Observable<IUser> {
    // 1. Procura o usuário no nosso "Banco de Dados Fake"
    const user = MOCK_USERS.find((u) => u.userName === userName && u.password === password);

    // 2. Se não achou (senha ou email errados) -> Dispara um erro 401
    if (!user) {
      return throwError(() => new Error('Usuário ou senha incorretos'));
    }

    // 3. Se achou, mas o activated for false (ex: Clayton) -> Dispara erro 403
    if (!user.activated) {
      return throwError(() => new Error('Usuário inativo.Procure o RH'));
    }

    // 4. Se deu tudo certo, atualiza o Signal global com os dados do usuário
    this.currentUser.set(user);

    // 5. Retorna sucesso usando 'of' do RxJS e o 'delay' para simular 1,5 segundos de internet
    return of(user).pipe(delay(1500));
  }

  // Limpa o estado global ao sair do sistema
  logout() {
    this.currentUser.set(null);
  }
}
