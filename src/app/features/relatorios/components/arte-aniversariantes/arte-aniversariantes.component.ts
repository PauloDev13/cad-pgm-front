import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  OnInit,
  signal,
  ViewChild
} from '@angular/core';
import { AniversarianteModel } from '../../models/aniversariente.model';
import { NotificationService } from '../../../../shared/service/NotificationSnackbar.service';
import { ErrorHandlerService } from '../../../../shared/service/error-handler.service';
import { toPng } from 'html-to-image';

@Component({
  selector: 'app-arte-aniversariantes',
  imports: [],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed -left-[9999px] top-0">

      <div #moldeImagem class="w-[850px] bg-[#FDF8ED] p-12 font-sans">

        <div class="flex items-center justify-center gap-8 mb-8">
          <div class="flex flex-col items-center">
            <span class="text-base font-bold tracking-[0.25em] text-[#0A1D3C] uppercase">Listagem de</span>
            <h1 class="text-[2.25rem] font-black text-[#0A1D3C] leading-tight mt-1 mb-1">ANIVERSARIANTES</h1>

            <div class="flex items-center gap-4 text-[#C29B57] font-bold text-xl">
              <span class="text-3xl leading-none">&bull;</span>
              <span class="uppercase tracking-wide">{{ currentDate }}</span>
              <span class="text-3xl leading-none">&bull;</span>
            </div>
          </div>
        </div>

        <div class="relative bg-[#F2E5C9] rounded-xl ml-6 mt-4 mb-4 border border-[#E8DFC8]">
          <div
            class="absolute -left-7 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#0A1D3C] rounded-full flex items-center justify-center border-4 border-[#FDF8ED] shadow-sm">
            <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
            </svg>
          </div>
          <div class="py-2 pl-0 pr-2 text-center">
            <span class="text-[#0A1D3C] font-semibold text-[15px]">Parabéns a todos! Que este novo ciclo traga saúde, paz, realizações e muitas conquistas!</span>
          </div>
        </div>
        <div class="rounded-xl overflow-hidden shadow-sm border border-[#0A1D3C]">
          <table class="w-full text-[15px] text-[#0A1D3C] border-collapse">

            <thead class="bg-[#0A1D3C] text-white">
            <tr>
              <th class="py-4 px-4 font-semibold border-r border-white/20 w-36">
                <div class="flex items-center justify-center gap-2">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                  DATA
                </div>
              </th>
              <th class="py-4 px-4 font-semibold border-r border-white/20 text-left">
                <div class="flex justify-center items-center gap-2">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                  ANIVERSARIANTE
                </div>
              </th>
              <th class="py-4 px-4 font-semibold text-left">
                <div class="justify-center flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.118v0H5.622c-1.085-.082-1.872-1.024-1.872-2.118v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
                  </svg>
                  SETOR
                </div>
              </th>
            </tr>
            </thead>

            <tbody class="bg-white">
              @for (item of aniversariantes(); track item.nome) {
                <tr class="border-b border-[#E8DFC8] last:border-0">

                  <td class="py-1 px-0 border-r border-[#E8DFC8]">
                    <div
                      class="flex items-center gap-2 font-bold bg-[#FDF8ED] px-3 py-1.5 rounded-md w-fit mx-auto border border-[#E8DFC8]/60">
                      <svg class="w-4 h-4 text-[#C29B57]" fill="none" viewBox="0 0 24 24" stroke-width="2"
                           stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round"
                              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                      </svg>
                      {{ item.diaMes }}
                    </div>
                  </td>

                  <td class="py-1 px-2 border-r border-[#E8DFC8] font-semibold text-left text-[14px]">
                    {{ item.nome }}
                  </td>

                  <td class="py-1 px-2 text-left">
                    {{ item.setor }}
                  </td>
                </tr>
              }
            </tbody>

          </table>
        </div>
      </div>
    </div>
  `
})
export class ArteAniversariantesComponent implements OnInit {

  private readonly notificationService = inject(NotificationService);
  private readonly errorHandlerService = inject(ErrorHandlerService);

  aniversariantes = input.required<AniversarianteModel[]>();

  // Pega a referência da div que criamos no HTML
  @ViewChild('moldeImagem') moldeImagem!: ElementRef;

  currentDate: string = '';

  // Nome do mês atual dinâmico (ex: "maio")
  currentMonth = computed(() => {
    const currentDate = new Date();
    return currentDate.toLocaleString('pt-BR', { month: 'long' });
  });

  // Signal para o ano atual (ex: 2026)
  currentYear = signal(new Date().getFullYear());

  ngOnInit() {
    this.currentDate = `${this.currentMonth()}/${this.currentYear()}`;
  }

  generateArt() {
    const element = this.moldeImagem.nativeElement;
    const list = this.aniversariantes();

    if (list.length === 0) {
      this.notificationService.warning('Não há aniversariantes para gerar a imagem.');
      return;
    }

    // O html2canvas "tira a foto" do elemento HTML
    toPng(element, {
      pixelRatio: 2, // Escala 2 garante que a imagem fique em alta resolução (HD)
      backgroundColor: 'transparent' // Garante que o fundo da imagem será branco e não transparente
    }).then((imagemDataUrl) => {

      // Cria um link temporário e simula o clique para forçar o download
      const link = document.createElement('a');
      link.download = 'lista_aniversariantes.png';
      link.href = imagemDataUrl;
      link.click();

      this.notificationService.success('Imagem gerada e baixada com sucesso!', 'Exportar Imagem');

    }).catch(err => {
      this.errorHandlerService.handle(err, 'Erro ao gerar imagem');
    });
  }
}
