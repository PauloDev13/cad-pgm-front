import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

export const customHandlerError = (err: HttpErrorResponse) => {
  console.error('Erro na API:', err.error);
  const msg = err.error?.message || err.error || 'Erro ao processar solicitação';
  return throwError(() => new Error(msg));
};
