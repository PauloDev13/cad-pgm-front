import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  template: `
    <!--    <div-->
    <!--      class="flex flex-col items-center h-full max-w-7xl mx-auto p-6 md:p-5-->
    <!--      bg-gray-50 shadow-lg rounded-2xl"-->
    <!--    >-->
    <h1
      class="text-2xl md:text-3xl font-boldtracking-tight text-center
        text-blue-900 mt-8 md:mt-14 leading-tight"
    >
      Procuradoria Geral do Município de Natal
    </h1>

    <h2 class="text-1xl md:text-2xl font-semibold text-center text-blue-900">
      Prefeitura Municipal do Natal
    </h2>

    <img
      src="/img/logo.png"
      alt="Brasão e Logo Prefeitura de Natal"
      class="block w-60 md:w-92 h-auto mt-8 md:mt-10 mb-10 md:mb-10 mx-auto object-contain"
    />

    <h1
      class="text-2xl md:text-3xl font-bold tracking-tight text-center
        text-blue-900 leading-tight"
    >
      Gestão de Servidores
    </h1>

    <p class="text-sm md:text-lg font-medium mt-0 text-center text-blue-900">
      Departamento de Tecnologia da Informação
    </p>
    <!--    </div>-->
  `,
})
export default class HomeComponent {}
