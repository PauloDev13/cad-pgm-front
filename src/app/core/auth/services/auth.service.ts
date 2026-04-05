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
  // A chave que usaremos para guardar o usuário logado no localstorage
  private readonly AUTH_KEY = 'sistema_logged_user';

  constructor() {
    this.currentUser.set(this.getStoredLoggedUser());
  }

  // Método de Login simulando uma requisição HTTP
  login({ userName, password }: IFormLoginModel): Observable<IUser> {
    // Procura o usuário no nosso "Banco de Dados Fake"
    const users = this.getUsersDB();

    const user = users.find((u) => u.userName === userName && u.password === password);

    // Se não achou (senha ou email errados) -> Dispara um erro 401
    if (!user) {
      return throwError(() => new Error('Usuário ou senha incorretos'));
    }

    // Se achou, mas o activated for false (ex: Clayton) -> Dispara erro 403
    if (!user.activated) {
      return throwError(() => new Error('Usuário inativo.Procure o RH'));
    }

    // Se deu tudo certo, atualiza o Signal global com os dados do usuário
    this.currentUser.set(user);

    localStorage.setItem(this.AUTH_KEY, JSON.stringify(user));

    // Retorna sucesso usando 'of' do RxJS e o 'delay' para simular 1,5 segundos de internet
    return of(user).pipe(delay(1500));
  }

  // Limpa o estado global ao sair do sistema
  logout() {
    // Atribui null ao usuário logado
    this.currentUser.set(null);

    // Remove o usuário logado do localstorage
    localStorage.removeItem(this.AUTH_KEY);
  }

  register(newUser: IFormCadLoginModel) {
    const users = this.getUsersDB();
    // Verifica se o usuário ou e-mail já existe no nosso banco fake
    const userExists: IUser | undefined = users.find(
      (u) => u.userName === newUser.userName || u.email === newUser.email,
    );

    if (userExists) {
      return throwError(() => new Error('Nome de usuário ou e-mail já estão em uso.'));
    }

    // Cria o novo usuário gerando um ID falso (maior ID + 1)
    const newId = Math.max(...MOCK_USERS.map((u) => u.id)) + 1;

    const userToSave = {
      ...newUser,
      id: newId,
      permissions: [{ id: 2, description: 'guest' }], // Permissão padrão para novos usuários
    };

    // Salva no banco de dados "Fake"
    users.push(userToSave);

    // Salva o array de usuários no local storage
    this.saveUserDB(users);

    // Retorna sucesso simulando delay de rede
    return of(userToSave).pipe(delay(1500));
  }

  // MÉTODO PRIVADO PARA BUSCAR O USUÁRIO LOGADO NO LOCALSTORAGE
  private getStoredLoggedUser(): IUser | null {
    const stored = localStorage.getItem(this.AUTH_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  // MÉTODO PRIVADO PARA LER O ARRAY DE USUÁRIOS LOCALSTORAGE
  private getUsersDB(): IUser[] {
    const stored = localStorage.getItem(this.DB_Key);

    // Se já tem um array no localstorage, converte de volta para Array
    if (stored) {
      return JSON.parse(stored);
    }
    // Se for a primeira vez rodando, cria o array usando nosso MOCK como base
    localStorage.setItem(this.DB_Key, JSON.stringify(MOCK_USERS));
    return MOCK_USERS;
  }

  // MÉTODO PRIVADO PARA SALVAR O ARRAY NO LOCALSTORAGE
  private saveUserDB(users: IUser[]): void {
    localStorage.setItem(this.DB_Key, JSON.stringify(users));
  }
}
