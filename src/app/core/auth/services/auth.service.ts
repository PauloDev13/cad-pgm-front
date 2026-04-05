import { Injectable, signal } from '@angular/core';
import { IFormCadLoginModel, IFormLoginModel, IUser } from '../models/auth.model';
import { delay, Observable, of, throwError } from 'rxjs';
import { MOCK_USERS } from '../data/mock-users';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // O ESTADO GLOBAL: Qualquer componente pode ler isso para saber se há alguém logado
  currentUser = signal<IUser | null>(null);

  // A chave que usaremos no "banco de dados" do navegador
  private readonly DB_Key = 'sistema_users';

  // Método de Login simulando uma requisição HTTP
  login({ userName, password }: IFormLoginModel): Observable<IUser> {
    // 1. Procura o usuário no nosso "Banco de Dados Fake"
    const users = this.getUsersDB();

    const user = users.find((u) => u.userName === userName && u.password === password);

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

  register(newUser: IFormCadLoginModel) {
    const users = this.getUsersDB();
    // 1. Verifica se o usuário ou e-mail já existe no nosso banco fake
    const userExists = users.find(
      (u) => u.userName === newUser.userName || u.email === newUser.email,
    );

    if (userExists) {
      return throwError(() => new Error('Nome de usuário ou e-mail já estão em uso.'));
    }

    // 2. Cria o novo usuário gerando um ID falso (maior ID + 1)
    const newId = Math.max(...MOCK_USERS.map((u) => u.id)) + 1;

    const userToSave = {
      ...newUser,
      id: newId,
      permissions: [{ id: 2, description: 'guest' }], // Permissão padrão para novos usuários
    };

    // 3. Salva no banco de dados "Fake"
    users.push(userToSave);

    this.saveUserDB(users);

    // 4. Retorna sucesso simulando delay de rede
    return of(userToSave).pipe(delay(1500));
  }

  // MÉTODO PRIVADO PARA LER O BANCO
  private getUsersDB(): IUser[] {
    const stored = localStorage.getItem(this.DB_Key);

    // Se já tem banco, converte de volta para Array
    if (stored) {
      return JSON.parse(stored);
    }
    // Se for a primeira vez rodando, cria o banco usando nosso MOCK como base
    localStorage.setItem(this.DB_Key, JSON.stringify(MOCK_USERS));
    return MOCK_USERS;
  }

  // MÉTODO PRIVADO PARA SALVAR NO BANCO
  private saveUserDB(users: IUser[]): void {
    localStorage.setItem(this.DB_Key, JSON.stringify(users));
  }
}
