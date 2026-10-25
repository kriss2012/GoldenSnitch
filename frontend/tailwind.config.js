/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Preserved Tokens
        void: 'var(--void)',
        surface: 'var(--surface)',
        plum: 'var(--plum)',
        brand: 'var(--brand)',
        violet: {
          DEFAULT: 'var(--violet)',
          glow: 'var(--violet-glow)',
          pressed: 'var(--violet-pressed)',
        },
        lilac: 'var(--lilac)',
        text: {
          DEFAULT: 'var(--text)',
          muted: 'var(--text-muted)',
        },
        border: {
          DEFAULT: 'var(--border)',
          bright: 'var(--border-bright)',
        },
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',

        // Dark Charcoal & Cyan Reference Design Tokens
        charcoal: {
          main: '#0B0B0B',
          sidebar: '#101010',
          card: '#242424',
          panel: '#242424',
          elevated: '#2B2B2B',
          hover: '#353535',
          border: '#353535',
          borderLight: '#454545',
        },
        cyan: {
          DEFAULT: '#82EAF4',
          hover: '#64E8F2',
          muted: '#788B8D',
          glow: 'rgba(130, 234, 244, 0.25)',
          border: 'rgba(130, 234, 244, 0.40)',
          bg: 'rgba(130, 234, 244, 0.08)',
        },
        gold: '#F5B83D',
        mutedCyan: '#788B8D',
        textPrimary: '#F5F5F5',
        textSecondary: '#B8B8B8',
        textDim: '#777777',
      },
      fontFamily: {
        sans: ['Figtree', 'sans-serif'],
        heading: ['"Bricolage Grotesque"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        panel: '16px',
        control: '10px',
        '2xl': '16px',
        '3xl': '24px',
      },
      maxWidth: {
        container: '1440px',
      },
      screens: {
        'xs': '360px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1440px',
      },
    },
  },
  plugins: [],
}
