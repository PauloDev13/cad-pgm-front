import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  template: `
    <h1
      class="text-2xl md:text-3xl font-semibold text-center
        text-blue-900 mt-8 md:mt-14 leading-tight"
    >
      Gestão de Servidores
    </h1>

    <img
      src="/img/logo_home_2.png"
      alt="Logo gestão"
      class="block w-auto md:w-[750px] h-auto mt-8 md:mt-10 mb-10 md:mb-10 mx-auto object-contain"
    />

    <!--    <h1-->
    <!--      class="text-2xl md:text-3xl font-bold tracking-tight text-center-->
    <!--        text-blue-900 leading-tight"-->
    <!--    >-->
    <!--      Gestão de Servidores-->
    <!--    </h1>-->

    <p class="text-sm md:text-lg font-medium mt-0 text-center text-blue-900">
      Departamento de Tecnologia da Informação
    </p>
  `,
})
export default class HomePage {}
