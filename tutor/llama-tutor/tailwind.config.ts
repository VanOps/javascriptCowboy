import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Paleta cálida para Llama Tutor — tonos tierra/fuego
      colors: {
        llama: {
          bg: '#1a1220',
          panel: '#231a2e',
          border: '#3d2e4a',
          text: '#e2d9ea',
          accent: '#f59e0b',
          fire: '#ef4444',
          ember: '#f97316',
          success: '#10b981',
          muted: '#8b7a9e',
        },
      },
    },
  },
  plugins: [],
};
export default config;
