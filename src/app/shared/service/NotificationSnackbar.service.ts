import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { SnackbarData } from '../model/snackbar-data.model';
import { CustomSnackBarComponent } from '../components/custom-snack-bar/custom-snack-bar.component';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private snackBar: MatSnackBar = inject(MatSnackBar);

  // Configuração padrão, caso não passem nada
  private defaultConfig: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'center',
    verticalPosition: 'top',
    panelClass: ['custom-snackbar-container'] // Remove o fundo feio padrão do Material
  };

  // Dispara um Toast de SUCESSO (Verde)
  success(message: string, title?: string, config?: MatSnackBarConfig): void {
    this.show('success', message, title, config);
  }


  // Dispara um Toast de ERRO (Vermelho)
  error(message: string, title?: string, config?: MatSnackBarConfig): void {
    this.show('error', message, title, config);
  }


  // Dispara um Toast de ALERTA (Amarelo Escuro)
  warning(message: string, title?: string, config?: MatSnackBarConfig): void {
    this.show('warning', message, title, config);
  }

  // Método privado que exibe as mensagens e as configurações do snakbar
  private show(
    type: 'success' | 'error' | 'warning',
    message: string,
    title?: string,
    config?: MatSnackBarConfig
  ): void {

    // Dados recebidos pelo snackbar
    const data: SnackbarData = { type, message, title };

    // Mescla a configuração padrão com a configuração passada pelo usuário
    const finalConfig = { ...this.defaultConfig, ...config, data };

    this.snackBar.openFromComponent(CustomSnackBarComponent, finalConfig);
  }
}
