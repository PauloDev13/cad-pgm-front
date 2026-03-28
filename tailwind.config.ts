import { Config } from 'tailwindcss';
// Importação moderna padrão do TypeScript/ESM
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      // 1. Configuração da Fonte
      fontFamily: {
        // Sobrescreve a fonte 'sans' padrão colocando a 'Inter' no topo da prioridade,
        // mas mantém os fallbacks originais do Tailwind espalhados com o spread operator (...)
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },

      // 2. Cores Semânticas Customizadas
      colors: {
        menu: {
          icon: '#6b7280', // Para uso com text-menu-icon
          'hover-bg': '#eff6ff', // Para uso com bg-menu-hover-bg
          'hover-text': '#1d4ed8', // Para uso com text-menu-hover-text
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
