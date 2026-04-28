import type { Config } from 'tailwindcss';

/**
 * Lightning McGreen Living — Tailwind theme.
 *
 * Palette is original: green-lightning + gingerbread + caramel + peppermint.
 * It is "inspired by friendly animated racing films and professional motorsport
 * dashboards" — never copies Disney/Pixar/NASCAR/etc. assets.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Core green-lightning palette
        lightning: {
          50: '#ecffe6',
          100: '#d3ffc4',
          200: '#a8ff86',
          300: '#75ff45',
          400: '#4ff518',
          500: '#34db00', // primary "go" green
          600: '#23a800',
          700: '#1a7d04',
          800: '#16620a',
          900: '#13510e',
          950: '#022d00',
        },
        // Gingerbread / cookie tones
        gingerbread: {
          50: '#fbf3e7',
          100: '#f4e0c0',
          200: '#e9c188',
          300: '#dca257',
          400: '#c98538',
          500: '#a86926', // primary cookie
          600: '#7d4c1b',
          700: '#5e3914',
          800: '#3f260d',
          900: '#241507',
        },
        // Caramel highlights / borders
        caramel: {
          400: '#d49a4f',
          500: '#b8782a',
          600: '#8a5715',
        },
        // Peppermint accent
        peppermint: {
          500: '#ff4f5e',
          600: '#d8323f',
        },
        // Frosting / cream surfaces
        frosting: {
          50: '#fffaf0',
          100: '#fff3dc',
          200: '#ffe7b3',
        },
        // Chocolate-asphalt road
        chocolate: {
          700: '#3c2412',
          800: '#2a1809',
          900: '#1a0d05',
        },
        // Additive token aliases from the deeper research pass
        // (kept as separate names so existing classes keep working)
        candy: {
          cream: '#FFF8EE',
          icing: '#F5F7FB',
          sugar: 'rgba(255,255,255,0.72)',
        },
        roof: { cookie: '#8A522C' },
        gumdrop: { mint: '#57E389' },
        flag: { charcoal: '#1D1F24' },
      },
      fontFamily: {
        // Custom display via CSS variable; OS-stack fallback is intentional so
        // we never pull a copyrighted font without a license.
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        cookie:
          '0 2px 0 0 rgba(94, 57, 20, 0.45), 0 8px 24px -8px rgba(94, 57, 20, 0.35)',
        bolt: '0 0 0 2px rgba(52, 219, 0, 0.4), 0 8px 32px -4px rgba(52, 219, 0, 0.45)',
        candy:
          '0 1px 0 0 rgba(255, 255, 255, 0.6) inset, 0 12px 32px -12px rgba(168, 105, 38, 0.4)',
      },
      borderRadius: {
        cookie: '1.25rem',
        gumdrop: '999px',
      },
      backgroundImage: {
        'checkered':
          'repeating-conic-gradient(#1a0d05 0% 25%, #fffaf0 0% 50%) 50% / 18px 18px',
        'frosting-gradient':
          'linear-gradient(180deg, rgba(255,250,240,0.9) 0%, rgba(255,243,220,0.7) 100%)',
        'asphalt':
          'linear-gradient(180deg, #1a0d05 0%, #2a1809 50%, #1a0d05 100%)',
        'lightning-gradient':
          'linear-gradient(135deg, #34db00 0%, #75ff45 40%, #4ff518 100%)',
        'candy-stripe':
          'repeating-linear-gradient(45deg, #ff4f5e 0 10px, #fffaf0 10px 20px)',
      },
      keyframes: {
        'bolt-pulse': {
          '0%, 100%': { transform: 'scale(1)', filter: 'drop-shadow(0 0 0 rgba(52,219,0,0))' },
          '50%': { transform: 'scale(1.06)', filter: 'drop-shadow(0 0 12px rgba(52,219,0,0.85))' },
        },
        'rain-fall': {
          '0%': { transform: 'translate3d(0, -10vh, 0) rotate(0deg)', opacity: '0' },
          '15%': { opacity: '0.85' },
          '100%': { transform: 'translate3d(0, 110vh, 0) rotate(360deg)', opacity: '0' },
        },
        'speed-line': {
          '0%': { transform: 'translateX(-110%)' },
          '100%': { transform: 'translateX(110%)' },
        },
      },
      animation: {
        'bolt-pulse': 'bolt-pulse 2.4s ease-in-out infinite',
        'rain-fall': 'rain-fall linear infinite',
        'speed-line': 'speed-line 1.4s cubic-bezier(.6,.05,.4,.95) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
