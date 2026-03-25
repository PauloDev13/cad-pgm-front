import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { getPortuguesePaginatorIntl } from './shared/utils/custom-paginator-intl';
import { provideHotToastConfig } from '@ngxpert/hot-toast';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideRouter(routes),
    provideHotToastConfig({ style: { marginTop: '70px' }, stacking: 'depth', duration: 1000 }),
    // permite a exibição do calendário no componente Datepicker
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    { provide: MatPaginatorIntl, useValue: getPortuguesePaginatorIntl() },
  ],
};
