import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoginStateService {
  // Esse Signal vai guardar o nome temporariamente no "limbo"
  userNameSugerido = signal<string>('');
}
