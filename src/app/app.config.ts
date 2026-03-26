import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { DateAdapter, MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { getPortuguesePaginatorIntl } from './shared/utils/custom-paginator-intl';
import { provideHotToastConfig } from '@ngxpert/hot-toast';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { PtBrDateAdapter } from './shared/utils/date-adapter';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideRouter(routes),
    provideHotToastConfig({ style: { marginTop: '50px' }, stacking: 'depth', duration: 3000 }),
    // permite a exibição do calendário no componente Datepicker
    provideNativeDateAdapter(),
    provideEnvironmentNgxMask(),
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    { provide: MatPaginatorIntl, useValue: getPortuguesePaginatorIntl() },
    { provide: DateAdapter, useClass: PtBrDateAdapter },
  ],
};
