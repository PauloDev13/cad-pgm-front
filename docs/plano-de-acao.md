# Plano de Ação - Refatoração e Melhorias CAD-PGM-FRONT

Documento técnico contendo o planejamento de correções, melhorias de UI/UX, prevenção de inconsistências e evolução arquitetural do projeto Angular.

---

## 🎯 Visão Geral do Projeto

* **Framework:** Angular 21.2.x (Standalone Components, Signals, Signal Forms, rxResource)
* **Gerenciamento de Estado:** `@ngrx/signals` (SignalStore)
* **Estilização:** Tailwind CSS v4 & Angular Material
* **Backend:** Java Spring Boot (REST API, Spring Security JWT, Spring Data Pageable, Server-Sent Events)

---

## 📋 Status de Execução das Etapas

### Etapa 1: Prioridades Críticas (Concluída)
* [x] **1.1. Corrigir Bug do Interceptor (`authInterceptor`):**
  * **Problema:** O interceptor retornava `EMPTY` em erros 413, 0/502 e 500, travando spinners e observables.
  * **Ação Realizada:** Modificado [auth.interceptor.ts](file:///c:/Desenvolvimento/_PROJETOS_ANGULAR/cad-pgm-front/src/app/core/auth/interceptors/auth.interceptor.ts) para registrar notificação e propagar o erro com `throwError(() => error)`.
* [x] **1.2. Renomear Diretório com Espaço no Nome:**
  * **Problema:** A pasta `temporary -password-dialog` continha um espaço em branco indevido.
  * **Ação Realizada:** Renomeada para `temporary-password-dialog` e imports atualizados em [usuario-list.page.ts](file:///c:/Desenvolvimento/_PROJETOS_ANGULAR/cad-pgm-front/src/app/features/usuario/pages/usuario-list.page.ts).
* [x] **1.3. Validação do Build:**
  * Executado `npm run build` com sucesso.

---

### Etapa 2: Prioridades Altas (Concluída)
* [x] **2.1. Correção da Reatividade de Permissões com Signals:**
  * **Problema:** Chamadas estáticas `canManager = this.authStore.canManager()` e `canEdit = this.authStore.canEdit()` perdiam a reatividade dos Signals.
  * **Ação Realizada:** Mantidas as referências de Signal nas classes e chamadas reativas `canManager()` / `canEdit()` nos templates (`@if (canManager())` e `@if (canEdit())`) em [sidebar.component.ts](file:///c:/Desenvolvimento/_PROJETOS_ANGULAR/cad-pgm-front/src/app/shared/layout/component/sidebar.component.ts), [header.component.ts](file:///c:/Desenvolvimento/_PROJETOS_ANGULAR/cad-pgm-front/src/app/shared/layout/component/header.component.ts) e [servidor-table.component.ts](file:///c:/Desenvolvimento/_PROJETOS_ANGULAR/cad-pgm-front/src/app/features/servidor/component/servidor-table/servidor-table.component.ts).
* [x] **2.2. Preservação de `HttpErrorResponse` e Enriquecimento do `ErrorHandlerService`:**
  * **Problema:** `customHandlerError` convertia `HttpErrorResponse` em `new Error(msg)`, perdendo os detalhes de validação Spring Boot.
  * **Ação Realizada:** [custom-handler-error.ts](file:///c:/Desenvolvimento/_PROJETOS_ANGULAR/cad-pgm-front/src/app/shared/utils/custom-handler-error.ts) ajustado para repassar o `HttpErrorResponse` e [error-handler.service.ts](file:///c:/Desenvolvimento/_PROJETOS_ANGULAR/cad-pgm-front/src/app/shared/service/error-handler.service.ts) aprimorado com suporte a `ProblemDetail` (RFC 7807), Bean Validation (`err.error.errors`) e verificação de `globalHandled`.

---

### Etapa 3: Prioridades Médias (Concluída)
* [x] **3.1. Correção de Rotas e Bindings da Sidebar:**
  * Link da Home corrigido de `/inicio` para `/home` no [sidebar.component.ts](file:///c:/Desenvolvimento/_PROJETOS_ANGULAR/cad-pgm-front/src/app/shared/layout/component/sidebar.component.ts).
  * Binding `onOpen="isOpen()"` corrigido para property binding `[onOpen]="isOpen()"`.
* [x] **3.2. Correção Estrutural de CSS e Configuração do Tailwind v4:**
  * Fechamento da chave do `@media (min-width: 640px)` corrigido em [styles.css](file:///c:/Desenvolvimento/_PROJETOS_ANGULAR/cad-pgm-front/src/styles.css), liberando `@media print` e `.custom-scrollbar` no escopo global.
  * Diretiva `@theme` adicionada no `styles.css` com a fonte `Inter` e cores semânticas do menu.
* [x] **3.3. Ajuste de Responsividade de Modais e Limpeza de Template:**
  * Removido `height: 400px` fixo no `openForm` de [usuario-list.page.ts](file:///c:/Desenvolvimento/_PROJETOS_ANGULAR/cad-pgm-front/src/app/features/usuario/pages/usuario-list.page.ts).
  * Removido caractere `>` solto no template do [servidor-form.component.ts](file:///c:/Desenvolvimento/_PROJETOS_ANGULAR/cad-pgm-front/src/app/features/servidor/component/servidor-form/servidor-form.component.ts) e ajustada a altura máxima fluida para `sm:max-h-[92vh]`.

---

### Etapa 4: Prioridades Baixas (Concluída)
* [x] **4.1. Enum de Status e Eliminação de Constantes Mágicas:**
  * Criado o enum `StatusServidorEnum` em [servidor.model.ts](file:///c:/Desenvolvimento/_PROJETOS_ANGULAR/cad-pgm-front/src/app/features/servidor/models/servidor.model.ts) e aplicado no `noDataRow` de [servidor-table.component.ts](file:///c:/Desenvolvimento/_PROJETOS_ANGULAR/cad-pgm-front/src/app/features/servidor/component/servidor-table/servidor-table.component.ts).
* [x] **4.2. Validação Global do Projeto:**
  * Executado `npm run build` com sucesso (código 0).
