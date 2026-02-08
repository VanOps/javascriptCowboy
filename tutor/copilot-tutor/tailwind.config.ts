import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Colores inspirados en el tema cowboy del curso
      colors: {
        cowboy: {
          sand: '#fff3e0',
          leather: '#f39c12',
          dark: '#0d1117',
          panel: '#161b22',
          border: '#30363d',
          text: '#c9d1d9',
          accent: '#58a6ff',
          green: '#238636',
        },
      },
    },
  },
  plugins: [],
};
export default config;
